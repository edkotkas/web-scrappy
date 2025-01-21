import type { ElementHandle } from 'puppeteer'
import type { Config } from './config.model.js'
import type { ProcessorService } from '../services/processor.service.js'
import type { Values } from './element.model.js'

export type IProcessor = new (processor: ProcessorService) => Processor

export abstract class Processor {
  constructor(
    public type: string,
    protected processor: ProcessorService
  ) {}

  abstract process(conf: Config, node: ElementHandle | null): Promise<Values>
}
