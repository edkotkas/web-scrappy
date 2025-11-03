import type { ElementHandle } from 'puppeteer'
import type { PageData, RecordConfig, RecordValue } from '@models'
import type { ContextService, ProcessorService } from '@services'
import { Processor } from '@models'

export class ObjectProcessor extends Processor {
  constructor(processor: ProcessorService) {
    super('Object', processor)
  }

  async process(
    conf: RecordConfig,
    node: ElementHandle,
    data: PageData,
    context: ContextService
  ): Promise<RecordValue> {
    const result: RecordValue = {}

    if (Object.keys(conf.props).length === 0) {
      throw new Error(`'props' not set`)
    }

    for (const prop of conf.props) {
      const proc = this.processor.get(prop.type)
      result[prop.key] = await proc.process(prop, node, data, context)
    }

    context.events.emit('step', conf, result)

    return result
  }
}
