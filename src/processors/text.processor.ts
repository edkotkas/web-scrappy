import type { ElementHandle } from 'puppeteer'
import type { PageData, TextConfig } from '@models'
import type { ContextService, ProcessorService } from '@services'
import { Processor } from '@models'
import { TextUtils } from '@utils'

export class TextProcessor extends Processor {
  constructor(processor: ProcessorService) {
    super('Text', processor)
  }

  async process(
    conf: TextConfig,
    node: ElementHandle,
    _: PageData,
    context: ContextService
  ): Promise<string | undefined> {
    try {
      const text = await node.$eval(conf.path, (e) => e.textContent)
      if (!text) {
        return ''
      }

      const result = TextUtils.process(conf, context, text)

      context.events.emit('step', conf, result)

      return result
    } catch (e) {
      const error = e as Error
      if (error.message.includes('failed to find element') && conf.null) {
        return ''
      }

      throw e
    }
  }
}
