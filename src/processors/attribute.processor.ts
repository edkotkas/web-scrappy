import type { ElementHandle } from 'puppeteer'
import type { AttributeConfig } from '@models'
import type { ProcessorService } from '@services'
import { Processor } from '@models'

export class AttributeProcessor extends Processor {

  constructor(processor: ProcessorService) {
    super('Attribute', processor)
  }

  async process(conf: AttributeConfig, node: ElementHandle): Promise<string | null> {
    const attr = conf.attr
    if (!attr) {
      throw new Error(`'attr' not set`)
    }
    
    try {
      const text = await node.$eval(conf.path, (e, a) => e.getAttribute(a), attr)
      return text ?? ''
    } catch (e) {
      const error = e as Error
      if (error.message.includes('failed to find element') && conf.nullable) {
        return ''
      }

      throw e
    }
  }
}
