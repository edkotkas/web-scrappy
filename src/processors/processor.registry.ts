import type {
  AdapterElement,
  AdapterPage,
  BrowserAdapter
} from '../interfaces/browser-adapter.interface.js'
import type { ScraperConfig } from '../interfaces/scraper-config.interface.js'
import type { VariableContainer } from '../utils/variable.js'

export interface ProcessorContext {
  page: AdapterPage
  element: AdapterElement
  config: ScraperConfig
  vars: VariableContainer
  browser: BrowserAdapter
  registry: ProcessorRegistry
}
export interface Processor {
  process(context: ProcessorContext): Promise<unknown>
}

export interface ProcessorRegistry {
  set(type: string, processor: Processor): void
  get(type: string): Processor
  defer(type: string, factory: () => Processor): void
}

export function createRegistry(): ProcessorRegistry {
  const processors = new Map<string, Processor>()
  const deferred = new Map<string, () => Processor>()

  function set(type: string, processor: Processor): void {
    processors.set(type, processor)
  }

  function get(type: string): Processor {
    if (deferred.has(type)) {
      const factory = deferred.get(type)

      if (!factory) {
        throw new Error(`deferred factory not found for type: ${type}`)
      }

      const processor = factory()

      processors.set(type, processor)
      deferred.delete(type)

      return processor
    }

    const processor = processors.get(type)

    if (!processor) {
      throw new Error(`processor not found for type: ${type}`)
    }

    return processor
  }

  function defer(type: string, factory: () => Processor): void {
    if (deferred.has(type)) {
      throw new Error(`processor already deferred for type: ${type}`)
    }

    deferred.set(type, factory)
  }

  return {
    set,
    get,
    defer
  }
}
