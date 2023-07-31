import type { ElementHandle } from 'puppeteer'
import type { PageData, RecordConfig, RecordValue } from '@models'
import type { ProcessorService } from '@services'
import { Processor } from '@models'
import log from '../logger'

export class ObjectProcessor extends Processor {
  constructor(processor: ProcessorService) {
    super('Object', processor)
  }

  async process(conf: RecordConfig, node: ElementHandle, pupData: PageData): Promise<RecordValue> {
    const result: Record<string, unknown> = {}

    for (const prop of conf.props) {
      const proc = this.processor.get(prop.type)
      result[prop.key] = await proc.process(prop, node, pupData)
      log(this.type, prop.key, result[prop.key])
    }

    return result as RecordValue
  }
}
