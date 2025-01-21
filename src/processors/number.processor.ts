import type { ElementHandle } from 'puppeteer'
import type { Config } from '../models/config.model.js'
import type { ProcessorService } from '../services/processor.service.js'
import { Processor } from '../models/processor.model.js'

export class NumberProcessor extends Processor {
  private textProcessor: Processor

  constructor(processor: ProcessorService) {
    super('Number', processor)

    this.textProcessor = this.processor.get('Text')
  }

  async process(conf: Config, node: ElementHandle): Promise<number | null> {
    const result = await this.textProcessor.process(conf, node)
    const num = Number(result)
    return isNaN(num) ? num : null
  }
}
