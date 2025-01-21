import type { Page } from 'puppeteer'
import type { Config } from '../models/config.model.js'
import type { Processor, IProcessor } from '../models/processor.model.js'

export class ProcessorService {
  processors: Record<string, Processor> = {}

  register(processor: IProcessor, overwrite?: boolean): void {
    const proc = new processor(this)
    if (proc.type in this.processors && !overwrite) {
      throw new Error(`'${proc.type}' processor already registered`)
    }

    this.processors[proc.type] = proc
  }

  get(name: string): Processor {
    if (!(name in this.processors)) {
      throw new Error(`'${name}' processor not registered`)
    }

    return this.processors[name]
  }

  async read(conf: Config, page: Page): Promise<unknown> {
    const processor = this.get(conf.type)
    const node = await page.$('html')

    return processor.process(conf, node)
  }
}
