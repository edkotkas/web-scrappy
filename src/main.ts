import env from './env'
import type {
  ConfigTypes,
  ContextEvents,
  ScrappyOptions,
  Values
} from '@models'
import {
  AttributeProcessor,
  ImageProcessor,
  ListProcessor,
  NumberProcessor,
  ObjectProcessor,
  ReferenceProcessor,
  TextProcessor,
  FollowProcessor
} from '@processors'
import { ProcessorService, PuppyService, ContextService } from '@services'

export class Scrappy {
  private readonly processor: ProcessorService
  private readonly context: ContextService

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
    this.context = new ContextService()

    env.log = opts?.log ?? false
    env.adblock = opts?.adblock ?? false

    const puppy = new PuppyService(this.context, opts)

    this.processor = new ProcessorService(puppy)
    this.processors.forEach((proc) => {
      this.processor.register(proc)
    })
  }

  async init(conf: ConfigTypes | ConfigTypes[]): Promise<ContextEvents> {
    this.context.init(conf)
    await this.processor.init(this.context)
    return this.context.events
  }

  async fetch<T = Values>(url: string): Promise<T> {
    return this.processor.read(url) as T
  }

  async destroy(): Promise<void> {
    return this.processor.pup.destroy()
  }
}
