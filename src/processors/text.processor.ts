import type { ElementHandle } from 'puppeteer'
import type { TextConfig, Pattern } from '../models/config.model.js'
import type { ProcessorService } from '../services/processor.service.js'
import { Processor } from '../models/processor.model.js'

export class TextProcessor extends Processor {
  constructor(processor: ProcessorService) {
    super('Text', processor)
  }

  async process(conf: TextConfig, node: ElementHandle): Promise<string | null> {
    try {
      const text = await node.$eval(conf.path, (e) => e.textContent)
      if (!text) {
        return ''
      }

      const result = conf.pattern ? this.pattern(conf.pattern, text) : text

      return result
    } catch (e) {
      const error = e as Error
      if (error.message.includes('failed to find element') && conf.nullable) {
        return ''
      }

      throw e
    }
  }

  private pattern(pattern: Pattern, text: string): string | null {
    const match = RegExp(pattern.match).exec(text)
    return match?.[pattern.index] ?? null
  }
}
