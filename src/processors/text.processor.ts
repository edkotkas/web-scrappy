import type { ElementHandle } from 'puppeteer'
import type { Pattern, TextConfig } from '@models'
import type { ProcessorService } from '@services'
import { Processor } from '@models'
import log from '../logger'

export class TextProcessor extends Processor {
  constructor(processor: ProcessorService) {
    super('Text', processor)
  }

  async process(conf: TextConfig, node: ElementHandle): Promise<string | undefined> {
    try {
      const text = await node.$eval(conf.path, (e) => e.textContent)
      if (!text) {
        return ''
      }

      let result = conf.pattern ? this.pattern(conf.pattern, text) : text

      result = conf.trim ? result?.trim() ?? '' : result

      log(this.type, result)

      return result
    } catch (e) {
      const error = e as Error
      if (error.message.includes('failed to find element') && conf.nullable) {
        return ''
      }

      throw e
    }
  }

  private pattern(pattern: Pattern, text: string): string | undefined {
    const match = RegExp(pattern.match).exec(text)
    return match?.[pattern.index]
  }
}
