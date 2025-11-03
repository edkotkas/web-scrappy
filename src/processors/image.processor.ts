import type { ElementHandle, HTTPResponse } from 'puppeteer'
import type { AttributeConfig, ImageValue, PageData } from '@models'
import type { ContextService, ProcessorService } from '@services'
import type { AttributeProcessor } from '@processors'
import { Processor } from '@models'
import { TextUtils } from '@utils'

export class ImageProcessor extends Processor {
  private attrProcessor: AttributeProcessor

  constructor(processor: ProcessorService) {
    super('Image', processor)

    this.attrProcessor = this.processor.get('Attribute')
  }

  async process(
    conf: AttributeConfig,
    node: ElementHandle,
    data: PageData,
    context: ContextService
  ): Promise<ImageValue | undefined> {
    try {
      const attrConf: AttributeConfig = {
        ...conf,
        attr: conf.attr ?? ['src']
      }

      const el = await node.waitForSelector(conf.path, { visible: true })
      if (!el) {
        throw new Error(`failed to find element '${conf.path}'`)
      }

      const text = await this.attrProcessor.process(
        attrConf,
        node,
        data,
        context
      )

      console.log('text', text)
      if (!text) {
        if (conf.null) {
          return
        }

        throw new Error(`failed to get '${attrConf.attr}' in '${conf.path}'`)
      }

      const value = TextUtils.process(conf, context, text)
      if (!value) {
        if (conf.null) {
          return
        }

        throw new Error(`failed to process value from '${attrConf.attr}'`)
      }

      console.log('value', value)

      let url = undefined
      try {
        url = new URL(value).pathname
      } catch (e) {
        // throw new Error(`failed to parse url from '${value}'`)
        url = value
      }

      console.log('data', data)

      const res = this.getResponse(data.res, url)
      console.log('res found', res?.url())
      const buffer = await res?.buffer()
      if (!buffer) {
        if (conf.null) {
          return
        }

        throw new Error(`failed to get buffer for '${url}'`)
      }

      const result = { url: value, buffer }

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

  private getResponse(
    res: HTTPResponse[],
    url: string
  ): HTTPResponse | undefined {
    console.log(
      'res',
      res.map((r) => r.url())
    )
    return res.find((r) => r.url().includes(url))
  }
}
