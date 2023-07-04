import type { ElementHandle } from 'puppeteer'
import type { Config} from '@models'
import type { ProcessorService } from '@services'
import type { TextProcessor } from '@processors'
import { Processor } from '@models'

export class NumberProcessor extends Processor {

  private textProcessor: TextProcessor

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
