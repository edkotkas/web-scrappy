import type { ElementHandle } from 'puppeteer'
import type { ElementConfig, PageData } from '@models'
import type { ContextService, ProcessorService } from '@services'
import type { TextProcessor } from '@processors'
import { Processor } from '@models'
import { TextUtils } from '@utils'

export class NumberProcessor extends Processor {
  private textProcessor: TextProcessor

  constructor(processor: ProcessorService) {
    super('Number', processor)

    this.textProcessor = this.processor.get('Text')
  }

  async process(
    conf: ElementConfig,
    node: ElementHandle,
    data: PageData,
    context: ContextService
  ): Promise<number | undefined> {
    const text = await this.textProcessor.process(conf, node, data, context)
    if (!text) {
      if (conf.null) {
        return
      }

      throw new Error(`failed to get text in '${conf.path}'`)
    }

    const value = TextUtils.process(conf, context, text)
    const num = Number(value)
    const result = isNaN(num) ? num : null

    if (result === null) {
      if (conf.null) {
        return
      }

      throw new Error(`failed to get number in '${conf.path}'`)
    }

    context.events.emit('step', conf, result)

    return result
  }
}
