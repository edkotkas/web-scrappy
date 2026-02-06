import { ensureValue } from './helpers/ensure-value.js'
import { formatText } from './helpers/formatter.js'
import type { Processor } from './processor.registry.js'

export const createAttributeProcessor = (): Processor => ({
  async process({
    config,
    browser,
    element,
    vars
  }): Promise<string | string[] | null> {
    const attribute = ensureValue(
      await browser.extractAttribute(element, config),
      config,
      `no attribute "${config.attribute ?? ''}" found using path: ${config.path ?? 'element'}`
    )

    if (attribute === null) {
      return null
    }

    return formatText(config, attribute, vars)
  }
})
