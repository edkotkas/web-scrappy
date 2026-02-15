import type { Processor, ProcessorContext } from './processor.registry.js'

export const createListProcessor = (): Processor => ({
  async process(context: ProcessorContext): Promise<unknown[]> {
    const { element, config, browser, registry } = context

    if (!config.config) {
      throw new Error('config is required for list')
    }

    if (!config.path) {
      throw new Error('path is required for list')
    }

    const nodes = await browser.extractNodes(element, config.path)
    const results: unknown[] = []

    for (const node of nodes) {
      const processor = registry.get(config.config.type)

      const result = await processor.process({
        ...context,
        element: node,
        config: config.config
      })

      results.push(result)
    }

    return results
  }
})
