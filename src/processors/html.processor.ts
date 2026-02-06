import { ensureValue, formatText } from './helpers/index.js'
import type { Processor } from './processor.registry.js'

export const createHtmlProcessor = (): Processor => ({
  async process({ config, browser, element, vars }): Promise<string | null> {
    const html = ensureValue(
      await browser.extractHtml(element, config),
      config,
      `no html found using path: ${config.path ?? ''}`
    )

    if (html === null) {
      return null
    }

    return formatText(config, html, vars)
  }
})
