import { ensureValue } from './helpers/index.js'
import type { Processor, ProcessorContext } from './processor.registry.js'

export const createFollowProcessor = (): Processor => ({
  async process(context: ProcessorContext): Promise<unknown> {
    const { page, element, config, vars, browser, registry } = context

    if (!config.path) {
      throw new Error('path is required for follow')
    }

    if (!config.config) {
      throw new Error('config is required for follow')
    }

    if (!config.attribute) {
      throw new Error('attribute is required for follow')
    }

    const url = ensureValue(
      await browser.extractAttribute(element, config),
      config,
      `no attribute "${config.attribute ?? ''}" found for follow`
    )

    if (url === null) {
      return null
    }

    const baseUrl = page.url()
    const absoluteUrl = new URL(url, baseUrl).href

    await browser.navigateToPage(page, {
      url: absoluteUrl,
      config: config.config
    })

    const processor = registry.get(config.config.type)
    const savedVars = vars.clone()

    vars.setupPage(page)
    vars.setFromConfig(config.config.vars)

    const result = await processor.process({
      ...context,
      element,
      config: config.config
    })

    vars.restorePage(savedVars)

    return result
  }
})
