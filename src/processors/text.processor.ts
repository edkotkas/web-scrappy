import { ensureValue, formatText } from './helpers/index.js'
import type { Processor } from './processor.registry.js'

export const createTextProcessor = (): Processor => ({
  async process({ config, browser, element, vars }): Promise<string | null> {
    if (!config.path) {
      throw new Error('path is required for text')
    }

    const text = ensureValue(
      await browser.extractText(element, config),
      config,
      `No text found using path: ${config.path ?? 'element textContent'}`
    )

    if (text === null) {
      return null
    }

    return formatText(config, text, vars)
  }
})
