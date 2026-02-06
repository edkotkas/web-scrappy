import { type VariableContainer } from '../context/vars.service.js'
import type {
  AdapterPage,
  BrowserAdapter
} from '../interfaces/browser-adapter.interface.js'
import type { ScraperConfig } from '../interfaces/scraper-config.interface.js'
import { ProcessorRegistry } from '../processors/processor.registry.js'

export class ScraperEngine {
  constructor(
    private readonly browser: BrowserAdapter,
    private readonly registry: ProcessorRegistry,
    private readonly vars: VariableContainer
  ) {}

  async scrape(config: ScraperConfig): Promise<unknown> {
    if (!config.url) {
      throw new Error('url is required')
    }

    const startTime = Date.now()
    const page = await this.browser.createPage()

    await this.browser.navigateToPage(page, {
      url: config.url,
      config
    })

    this.vars.setupPage(page)

    const data = await this.extractData(page, config)

    const duration = Date.now() - startTime

    await this.browser.closePage(page)

    console.log(`Scraping completed in ${duration.toString()}ms`)

    return data
  }

  async extractData(
    page: AdapterPage,
    config: ScraperConfig
  ): Promise<unknown> {
    const processor = this.registry.get(config.type)
    const element = await this.browser.root(page, config.root)

    if (!element) {
      throw new Error('failed to get root element: ' + (config.root ?? 'html'))
    }

    const result = await processor.process({
      page,
      element,
      config,
      vars: this.vars,
      browser: this.browser,
      registry: this.registry
    })

    if (config.id) {
      this.vars.set(config.id, result as string)
    }

    return result
  }
}
