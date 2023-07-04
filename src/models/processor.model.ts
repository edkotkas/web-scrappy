import type { ElementHandle } from 'puppeteer'
import type { Config, Values } from '@models'
import type { ProcessorService } from '@services'

export type IProcessor = new (processor: ProcessorService) => Processor

export abstract class Processor {

  constructor(
    public type: string,
    protected processor: ProcessorService
  ) {}

  abstract process(conf: Config, node: ElementHandle | null): Promise<Values>
}
