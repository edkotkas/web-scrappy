import path from 'path'

import { ScraperService } from '../src/services/scraper.service'
import { PuppetService } from '../src/services/puppet.service'
import { ElementConfig } from '../src/models/element.model'

import config from './data/config.json'
import output from './data/output.json'
import outputNoTransform from './data/output_no_transform.json'

describe('ScraperService', () => {
  let service: ScraperService
  let conf: any
  const puppet = new PuppetService()

  beforeEach(async () => {
    await puppet.init()
    await puppet.fetch(path.join('file://', process.cwd(), 'tests', 'data', 'index.html'))

    conf = Object.assign({}, config) as any
  })
  afterEach(async () => {
    await puppet.destroy()
  })

  describe('valid config', () => {
    beforeEach(() => {
      service = new ScraperService(conf as ElementConfig, puppet.page)
    })

    it('should create', () => {
      expect(service).toBeDefined()
    })

    it('should read', async () => {
      const result = await service.read()
      expect(result).toEqual(output)
    })
  })

  describe('invalid config', () => {
    it('should throw invalid prop error', async () => {
      conf.type = ''
      const service = new ScraperService(conf as ElementConfig, puppet.page)
      await expectAsync(service.read()).toBeRejectedWithError(`not a valid prop type '${conf.type}'`)
    })

    it('should throw invalid prop error', async () => {
      conf.value = null
      const service = new ScraperService(conf as ElementConfig, puppet.page)
      await expectAsync(service.read()).toBeRejectedWithError(`'no value provided for list in '${conf.path}'`)
    })

    describe('invalid sort', () => {
      beforeEach(() => {
        conf.options.sort = {
          by: "price",
          order: "desc"
        }
        
        service = new ScraperService(conf as ElementConfig, puppet.page)
      })

      it('should throw invalid sort by error', async () => {
        conf.options.sort.by = null
        await expectAsync(service.read()).toBeRejectedWithError(`invalid sort by option provided in '${conf.path}'`)
      })

      it('should throw invalid sort order error', async () => {
        conf.options.sort.order  = null
        await expectAsync(service.read()).toBeRejectedWithError(`invalid sort order option provided in '${conf.path}'`)
      })

      it('should throw invalid sort order error', async () => {
        await expectAsync(service.read()).toBeResolvedTo(outputNoTransform)
      })
    })

    describe('invalid object', () => {
      beforeEach(() => {
        conf.value = {
          type: "object",
          props: [
            {
              path: ".header h3",
              type: "text",
              key: "title"
            }
          ]
        }
        
        service = new ScraperService(conf as ElementConfig, puppet.page)
      })

      it('should throw no props error', async () => {
        conf.value.props = null
        await expectAsync(service.read()).toBeRejectedWithError(`no props provided for object in 'undefined'`)
      })

      it('should throw no key error', async () => {
        conf.value.props[0].key = null
        await expectAsync(service.read()).toBeRejectedWithError(`no key provided for prop in 'undefined'`)
      })

      it('should throw no key error', async () => {
        conf.value.props[0].type = null
        await expectAsync(service.read()).toBeRejectedWithError(`not a valid prop type 'null'`)
      })
    })
  })
})
