import type { ScrappyConfig } from '@models'
import { AttributeProcessor, ListProcessor, NumberProcessor, ObjectProcessor, TextProcessor } from '@processors'
import { ProcessorService, PuppyService } from '@services'

export class Scrappy {

  processor: ProcessorService
  puppy: PuppyService

  private processors = [
    TextProcessor,
    NumberProcessor,
    ObjectProcessor,
    ListProcessor,
    AttributeProcessor
  ]

  constructor(opts?: ScrappyConfig) {
    this.processor = new ProcessorService()
    this.processors.forEach(proc => {
      this.processor.register(proc)
    })

    this.puppy = new PuppyService(opts?.pupConfig)
  }
}
