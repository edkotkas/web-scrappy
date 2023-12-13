import type { ElementHandle } from 'puppeteer'
import type { Config, ConfigTypes, PageData, Values } from '@models'
import type { ContextService, ProcessorService } from '@services'
import EventEmitter from 'node:events'

export type EventKeys = 'step' | 'step-result'
export type ContextListener = (
  key: EventKeys,
  listener: (conf: ConfigTypes, result: Values) => void
) => EventEmitter
export type ContextEmitter = (
  key: EventKeys,
  conf: ConfigTypes,
  result: Values
) => boolean

export interface ContextEvents {
  on: ContextListener
  off: ContextListener
  emit: ContextEmitter
}

export type IProcessor = new (processor: ProcessorService) => Processor

export abstract class Processor {
  constructor(public type: string, protected processor: ProcessorService) {}

  abstract process(
    conf: Config,
    node: ElementHandle,
    data: PageData,
    context: ContextService
  ): Promise<Values>
}
