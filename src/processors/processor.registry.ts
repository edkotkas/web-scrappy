import type { VariableContainer } from '../context/vars.service.js'
import type {
  AdapterElement,
  AdapterPage,
  BrowserAdapter
} from '../interfaces/browser-adapter.interface.js'
import type { ScraperConfig } from '../interfaces/scraper-config.interface.js'

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
}

export function createRegistry(): ProcessorRegistry {
  const processors = new Map<string, Processor>()

  function set(type: string, processor: Processor): void {
    processors.set(type, processor)
  }

  function get(type: string): Processor {
    const processor = processors.get(type)

    if (!processor) {
      throw new Error(`processor not found for type: ${type}`)
    }

    return processor
  }

  return {
    set,
    get
  }
}

// export class ProcessorRegistry {
//   private readonly processors = new Map<string, Processor>()

//   set(type: string, processor: Processor): void {
//     this.processors.set(type, processor)
//   }

//   get(type: string): Processor {
//     const processor = this.processors.get(type)

//     if (!processor) {
//       throw new Error(`Processor not found for type: ${type}`)
//     }

//     return processor
//   }
// }
