import type { ElementHandle } from 'puppeteer'
import type { AttributeConfig, PageData } from '@models'
import type { ContextService, ProcessorService } from '@services'
import { Processor } from '@models'
import { TextUtils } from '@utils'
import log from '../logger.js'

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

    log('attr', attr)

    try {
      const text = await node.$eval(
        conf.path,
        (e, a) => {
          const attrs = a.map((x) => e.getAttribute(x))

          return attrs.find((x) => x)
        },
        attr
      )

      if (!text) {
        if (conf.null) {
          return
        }

        throw new Error(
          `failed to get attribute '${attr.join(', ')}' in '${conf.path}'`
        )
      }

      log('text', text)

      const result = TextUtils.process(conf, context, text)
      if (!result) {
        if (conf.null) {
          return
        }

        throw new Error(
          `failed to process value from attribute '${attr.join(', ')}'`
        )
      }

      log('result', result)

      context.events.emit('step', conf, result)

      return result
    } catch (e) {
      const error = e as Error
      if (error.message.includes('failed to find element') && conf.null) {
        return
      }

      throw e
    }
  }
}
