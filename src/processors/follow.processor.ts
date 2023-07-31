import type { ElementHandle } from 'puppeteer'
import type { FollowConfig, Values } from '@models'
import type { ProcessorService } from '@services'
import type { AttributeProcessor } from '@processors'
import { Processor } from '@models'
import log from '../logger'

export class FollowProcessor extends Processor {
  private attrProcessor: AttributeProcessor

  constructor(processor: ProcessorService) {
    super('Follow', processor)
    this.attrProcessor = this.processor.get('Attribute')
  }

  async process(
    conf: FollowConfig,
    node: ElementHandle
  ): Promise<Values> {
    try {
      const url = await this.attrProcessor.process(conf, node)
      if (!url) {
        return
      }

      const result = await this.processor.follow(url, conf.conf)
      
      log(this.type, url, result)
      
      return result
    } catch (e) {
      const error = e as Error
      if (error.message.includes('failed to find element') && conf.nullable) {
        return
      }

      throw e
    }
  }
}
