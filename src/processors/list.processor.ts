import type { ElementHandle } from 'puppeteer'
import type { ListConfig, PageData, Values } from '@models'
import type { ProcessorService } from '@services'
import { Processor } from '@models'
import log from '../logger'

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
    pupData: PageData
  ): Promise<Values[]> {
    const proc = this.processor.get(conf.value.type)
    const nodes = await node.$$(conf.path)
    const procs = nodes.map((node) => proc.process(conf.value, node, pupData))

    if (!conf.sequence) {
      const result = await Promise.all(procs)
      log(this.type, result)
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

    log(this.type, results)

    return results
  }
}
