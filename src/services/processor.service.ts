import type { Config, ConfigTypes, IProcessor, Processor, Values } from '@models'
import type { PuppyService } from './puppy.service'
import type { ContextService } from './context.service'

export class ProcessorService {
  processors: Record<string, Processor> = {}

  context!: ContextService

  constructor(public pup: PuppyService) {}

  async init(context: ContextService): Promise<void> {
    this.context = context
    await this.pup.init()
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

  async read(url: string): Promise<Values> {
    const conf = this.context.main

    return this.follow(url, conf)
  }

  async follow(url: string, conf: Config): Promise<Values> {
    const data = await this.pup.fetch(url)
    const processor = this.get(conf.type)
    const node = await data.page.$(conf.root ?? 'html')
    if (!node) {
      if (conf.nullable) {
        return
      }

      throw new Error(`failed to get root node`)
    }

    const result = await processor.process(conf, node, data)
    await data.page.close()

    return result
  }

  getRef(ref: string): ConfigTypes {
    return this.context.getRef(ref)
  }
}
