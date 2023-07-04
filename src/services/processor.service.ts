import type { Config, IProcessor, Processor } from '@models'
import type { Page } from 'puppeteer'

export class ProcessorService {

  processors: Record<string, Processor> = {}

  constructor() {
  }

  register(processor: IProcessor, overwrite?: boolean): void {
    const proc = new processor(this)
    if (proc.type in this.processors && !overwrite) {
      throw new Error(`'${proc.type}' processor already registered`)
    }

    this.processors[proc.type] = proc
  }

  get<T = Processor>(name: string): T {
    if (!(name in this.processors)) {
      throw new Error(`'${name}' processor not registered`)
    }

    return this.processors[name] as T
  }

  async read(conf: Config, page: Page): Promise<unknown> {
    const processor = this.get(conf.type)
    const node = await page.$('html')

    return processor.process(conf, node)
  }
}
