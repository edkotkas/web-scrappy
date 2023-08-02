import type { ElementHandle } from 'puppeteer'
import type { AttributeConfig, PageData } from '@models'
import type { ContextService, ProcessorService } from '@services'
import { Processor } from '@models'

export class AttributeProcessor extends Processor {
  constructor(processor: ProcessorService) {
    super('Attribute', processor)
  }

  async process(
    conf: AttributeConfig,
    node: ElementHandle,
    _: PageData,
    context: ContextService
  ): Promise<string | undefined> {
    const attr = conf.attr
    if (!attr) {
      throw new Error(`'attr' not set`)
    }

    try {
      const text = await node.$eval(
        conf.path,
        (e, a) => e.getAttribute(a),
        attr
      )

      if (!text) {
        if (conf.nullable) {
          return
        }

        throw new Error(`failed to get attribute '${attr}' in '${conf.path}'`)
      }

      context.events.emit('step', conf, text)

      return text
    } catch (e) {
      const error = e as Error
      if (error.message.includes('failed to find element') && conf.nullable) {
        return
      }

      throw e
    }
  }
}
