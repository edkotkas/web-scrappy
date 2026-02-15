import type { Processor, ProcessorContext } from './processor.registry.js'

export const createObjectProcessor = (): Processor => ({
  async process(context: ProcessorContext): Promise<Record<string, unknown>> {
    const { config, registry } = context

    if (!config.props || config.props.length === 0) {
      throw new Error('Object processor requires a "props" array with at least one property')
    }

    const result: Record<string, unknown> = {}

    for (const prop of config.props) {
      if (!prop.key) {
        throw new Error('Each property in "props" must have a "key" field')
      }

      const processor = registry.get(prop.type)
      const value = await processor.process({ ...context, config: prop })

      result[prop.key] = value
    }

    return result
  }
})
