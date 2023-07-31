import type { ElementHandle } from 'puppeteer'
import type {  ElementConfig } from '@models'
import type { ProcessorService } from '@services'
import type { TextProcessor } from '@processors'
import { Processor } from '@models'
import log from '../logger'

export class NumberProcessor extends Processor {
  private textProcessor: TextProcessor

  constructor(processor: ProcessorService) {
    super('Number', processor)

    this.textProcessor = this.processor.get('Text')
  }

  async process(conf: ElementConfig, node: ElementHandle): Promise<number | undefined> {
    const text = await this.textProcessor.process(conf, node)
    const num = Number(text)
    const result = isNaN(num) ? num : null

    if (result === null) {
      if (conf.nullable) {
        return
      }

      throw new Error(`failed to get number in '${conf.path}'`)
    }

    log(this.type, result)

    return result
  }
}
