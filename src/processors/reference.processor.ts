import type { ElementHandle } from 'puppeteer'
import type { PageData, ReferenceConfig, Values } from '@models'
import type { ContextService, ProcessorService } from '@services'
import { Processor } from '@models'

export class ReferenceProcessor extends Processor {
  constructor(processor: ProcessorService) {
    super('Reference', processor)
  }

  async process(
    conf: ReferenceConfig,
    node: ElementHandle,
    data: PageData,
    context: ContextService
  ): Promise<Values> {
    try {
      if (!conf.use) {
        if (conf.nullable) {
          return
        }

        throw new Error(`failed to get ref '${conf.use}'`)
      }

      const ref = this.processor.getRef(conf.use)
      const proc = this.processor.get(ref.type)

      return proc.process(ref, node, data, context)
    } catch (e) {
      const error = e as Error
      if (error.message.includes('failed to find element') && conf.nullable) {
        return
      }

      throw e
    }
  }
}
