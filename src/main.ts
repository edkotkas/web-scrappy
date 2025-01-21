import type { ScrappyConfig } from './models/scrappy.model.js'
import { AttributeProcessor } from './processors/attribute.processor.js'
import { ListProcessor } from './processors/list.processor.js'
import { NumberProcessor } from './processors/number.processor.js'
import { ObjectProcessor } from './processors/object.processor.js'
import { TextProcessor } from './processors/text.processor.js'
import { ProcessorService } from './services/processor.service.js'
import { PuppyService } from './services/puppy.service.js'

export class Scrappy {
  processor: ProcessorService
  puppy: PuppyService

  private processors = [TextProcessor, NumberProcessor, ObjectProcessor, ListProcessor, AttributeProcessor]

  constructor(opts?: ScrappyConfig) {
    this.processor = new ProcessorService()

    this.processors.forEach((proc) => {
      this.processor.register(proc)
    })

    this.puppy = new PuppyService(opts?.pupConfig)
  }
}
