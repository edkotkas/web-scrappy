import type { ElementHandle } from 'puppeteer'
import type { ListConfig, PageData, Values } from '@models'
import type { ContextService, ProcessorService } from '@services'
import { Processor } from '@models'

export class ListProcessor extends Processor {
  constructor(processor: ProcessorService) {
    super('List', processor)
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async process(
    conf: ListConfig,
    node: ElementHandle,
    data: PageData,
    context: ContextService
  ): Promise<Values[]> {
    const proc = this.processor.get(conf.value.type)
    const nodes = await node.$$(conf.path)
    const procs = nodes.map((node) =>
      proc.process(conf.value, node, data, context)
    )

    if (!conf.sequence) {
      const result = await Promise.all(procs)
      context.events.emit('step', conf, result)

      return result
    }

    const results: Values[] = []
    for (const node of procs) {
      if (conf.delay && conf.delay > 0) {
        await this.delay(conf.delay)
      }

      const res = await node
      results.push(res)
    }

    context.events.emit('step', conf, results)

    return results
  }
}
