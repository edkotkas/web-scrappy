import type { ElementHandle } from 'puppeteer'
import type { FollowConfig, PageData, Values } from '@models'
import type { ContextService, ProcessorService } from '@services'
import type { AttributeProcessor } from '@processors'
import { Processor } from '@models'

export class FollowProcessor extends Processor {
  private attrProcessor: AttributeProcessor

  constructor(processor: ProcessorService) {
    super('Follow', processor)
    this.attrProcessor = this.processor.get('Attribute')
  }

  async process(
    conf: FollowConfig,
    node: ElementHandle,
    data: PageData,
    context: ContextService
  ): Promise<Values> {
    try {
      const url = await this.attrProcessor.process(conf, node, data, context)
      if (!url) {
        return
      }

      const result = await this.processor.follow(url, conf.conf)

      context.events.emit('step', conf, result)

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
