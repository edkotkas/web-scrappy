import type { ElementHandle } from 'puppeteer'
import type { Config, PageData, Values } from '@models'
import type { ContextService, ProcessorService } from '@services'

export type IProcessor = new (processor: ProcessorService) => Processor

export abstract class Processor {

  constructor(
    public type: string,
    protected processor: ProcessorService
  ) {}

  abstract process(conf: Config, node?: ElementHandle, data?: PageData, context?: ContextService): Promise<Values>
}
