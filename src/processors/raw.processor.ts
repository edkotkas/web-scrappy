import type { ElementHandle } from 'puppeteer'
import type { PageData, TextConfig } from '@models'
import type { ContextService, ProcessorService } from '@services'
import { Processor } from '@models'

export class RawProcessor extends Processor {
  constructor(processor: ProcessorService) {
    super('Raw', processor)
  }

  async process(
    conf: TextConfig,
    node: ElementHandle,
    _: PageData,
    context: ContextService
  ): Promise<string | undefined> {
    try {
      const text = await node.$eval(conf.path, (e) => e.outerHTML)
      if (!text) {
        return ''
      }

      // const result = TextUtils.process(conf, context, text)

      context.events.emit('step', conf, text)

      return text
    } catch (e) {
      const error = e as Error
      if (error.message.includes('failed to find element') && conf.null) {
        return ''
      }

      throw e
    }
  }
}
