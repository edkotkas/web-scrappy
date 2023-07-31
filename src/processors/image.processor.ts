import type { ElementHandle, HTTPResponse } from 'puppeteer'
import type { AttributeConfig, ElementConfig, ImageValue, PageData } from '@models'
import type { ProcessorService } from '@services'
import type { AttributeProcessor } from '@processors'
import { Processor } from '@models'
import log from '../logger'

export class ImageProcessor extends Processor {
  private attrProcessor: AttributeProcessor

  constructor(processor: ProcessorService) {
    super('Image', processor)

    this.attrProcessor = this.processor.get('Attribute')
  }

  async process(
    conf: ElementConfig,
    node: ElementHandle,
    data: PageData
  ): Promise<ImageValue | undefined> {
    try {
      const attrConf: AttributeConfig = {
        ...conf,
        attr: 'src'
      }

      const text = await this.attrProcessor.process(attrConf, node)
      if (!text) {
        if (conf.nullable) {
          return
        }

        throw new Error(`failed to get '${attrConf.attr}' in '${conf.path}'`)
      }

      const url = new URL(text)

      const res = this.getResponse(data.res, url.pathname)
      const buffer = await res?.buffer()
      if (!buffer) {
        if (conf.nullable) {
          return
        }

        throw new Error(`failed to get buffer for '${url.pathname}'`)
      }

      log(this.type, text, buffer)

      return { url: text, buffer }
    } catch (e) {
      const error = e as Error
      if (error.message.includes('failed to find element') && conf.nullable) {
        return
      }

      throw e
    }
  }

  private getResponse(res: HTTPResponse[], url: string): HTTPResponse | undefined {
    return res.find(r => r.url().includes(url))
  }
}
