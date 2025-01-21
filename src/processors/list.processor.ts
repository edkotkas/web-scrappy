import type { ElementHandle } from 'puppeteer'
import type { ListConfig } from '../models/config.model.js'
import type { ListValue } from '../models/element.model.js'
import { Processor } from '../models/processor.model.js'
import type { ProcessorService } from '../services/processor.service.js'

export class ListProcessor extends Processor {
  constructor(processor: ProcessorService) {
    super('List', processor)
  }

  async process(conf: ListConfig, node: ElementHandle): Promise<ListValue> {
    const proc = this.processor.get(conf.value.type)
    const nodes = await node.$$(conf.path)
    const processedNodes = nodes.map((el) => proc.process(conf.value, el))
    const list = await Promise.all(processedNodes)

    return list as ListValue
  }
}
