import type { ElementHandle } from 'puppeteer'
import type { RecordConfig, RecordValue } from '@models'
import type { ProcessorService } from '@services'
import { Processor } from '@models'

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
