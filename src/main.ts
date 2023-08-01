import env from './env'
import type { ConfigTypes, ScrappyOptions, Values } from '@models'
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

  constructor(opts?: ScrappyOptions) {
    env.log = opts?.log ?? false
    env.adblock = opts?.adblock ?? false

    const puppy = new PuppyService(opts)

    this.processor = new ProcessorService(puppy)
    this.processors.forEach((proc) => {
      this.processor.register(proc)
    })
  }

  async init(conf: ConfigTypes | ConfigTypes[]): Promise<void> {
    const context = new ContextService(conf)
    await this.processor.init(context)
  }

  async fetch<T = Values>(url: string): Promise<T> {
    return this.processor.read(url) as T
  }

  async destroy(): Promise<void> {
    return this.processor.pup.destroy()
  }
}
