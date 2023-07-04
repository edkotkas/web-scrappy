import type { ElementHandle } from 'puppeteer'
import type { ListValue, ListConfig } from '@models'
import type { ProcessorService } from '@services'
import { Processor } from '@models'

export class ListProcessor extends Processor {
  
  constructor(processor: ProcessorService) {
    super('List', processor)
  }

  async process(conf: ListConfig, node: ElementHandle): Promise<ListValue> {
    const proc = this.processor.get(conf.value.type)
    const nodes = await node.$$(conf.path)
    const processedNodes = nodes.map(el => proc.process(conf.value, el))
    const list = await Promise.all(processedNodes)

    return list as ListValue
  }
}
