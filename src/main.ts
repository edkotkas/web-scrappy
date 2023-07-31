import env from './env'
import type { Config, ScrappyOptions, Values } from '@models'
import {
  AttributeProcessor,
  ImageProcessor,
  ListProcessor,
  NumberProcessor,
  ObjectProcessor,
  ReferenceProcessor,
  TextProcessor
} from '@processors'
import { ProcessorService, PuppyService } from '@services'
import { FollowProcessor } from './processors/follow.processor'
import { ContextService } from './services/context.service'

export class Scrappy {
  private processor: ProcessorService

  private processors = [
    TextProcessor,
    NumberProcessor,
    ObjectProcessor,
    ListProcessor,
    AttributeProcessor,
    ImageProcessor,
    FollowProcessor,
    ReferenceProcessor
  ]

  constructor(conf: Config | Config[], opts?: ScrappyOptions) {
    env.log = opts?.log ?? false
    env.adblock = opts?.adblock ?? false

    const context = new ContextService(conf)
    const puppy = new PuppyService(opts)

    this.processor = new ProcessorService(puppy, context)
    this.processors.forEach((proc) => {
      this.processor.register(proc)
    })
  }

  async init(): Promise<void> {
    await this.processor.pup.init()
  }

  async fetch(url: string): Promise<Values> {
    return this.processor.read(url)
  }

  async destroy(): Promise<void> {
    return this.processor.pup.destroy()
  }
}
