import type { ElementHandle } from 'puppeteer'
import type { ElementConfig, PageData } from '@models'
import type { ContextService, ProcessorService } from '@services'
import type { TextProcessor } from '@processors'
import { Processor } from '@models'

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
    const num = Number(text)
    const result = isNaN(num) ? num : null

    if (result === null) {
      if (conf.nullable) {
        return
      }

      throw new Error(`failed to get number in '${conf.path}'`)
    }

    context.events.emit('step', conf, result)

    return result
  }
}
