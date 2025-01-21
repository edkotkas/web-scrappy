import type { ElementHandle } from 'puppeteer'
import type { RecordConfig } from '../models/config.model.js'
import type { RecordValue } from '../models/element.model.js'
import type { ProcessorService } from '../services/processor.service.js'
import { Processor } from '../models/processor.model.js'

export class ObjectProcessor extends Processor {
  constructor(processor: ProcessorService) {
    super('Object', processor)
  }

  async process(conf: RecordConfig, node: ElementHandle): Promise<RecordValue> {
    const result: Record<string, unknown> = {}

    for (const prop of conf.props) {
      const proc = this.processor.get(prop.type)
      result[prop.key] = await proc.process(prop, node)
    }

    return result as RecordValue
  }
}
