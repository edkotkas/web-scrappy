import { ensureValue, formatText } from './helpers/index.js'
import type { Processor } from './processor.registry.js'

export const createNumberProcessor = (): Processor => ({
  async process({ element, browser, config, vars }): Promise<number | null> {
    if (!config.path) {
      throw new Error('path is required for number')
    }

    const text = ensureValue(
      await browser.extractText(element, config),
      config,
      `No text found using path: ${config.path ?? ''}`
    )

    if (text === null) {
      return null
    }

    const formatted = formatText(config, text, vars)

    if (isNaN(+formatted)) {
      throw new Error(`value is not a valid number: ${text} -> ${formatted}`)
    }

    return +formatted
  }
})
