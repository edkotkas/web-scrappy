import type {
  AdapterPage,
  BrowserAdapter
} from '../interfaces/browser-adapter.interface.js'
import type { ScraperConfig } from '../interfaces/scraper-config.interface.js'
import { ProcessorRegistry } from '../processors/processor.registry.js'
import { type VariableContainer } from '../utils/variable.js'

export type ScrapeFunc = (config: ScraperConfig) => Promise<unknown>

export function createScraper(
  browser: BrowserAdapter,
  registry: ProcessorRegistry,
  vars: VariableContainer
): ScrapeFunc {
  async function scrape(config: ScraperConfig): Promise<unknown> {
    if (!config.url) {
      throw new Error('url is required')
    }

    const startTime = Date.now()
    const page = await browser.createPage()

    await browser.navigateToPage(page, {
      url: config.url,
      config
    })

    vars.setupPage(page)

    const data = await extractData(page, config)

    const duration = Date.now() - startTime

    await browser.closePage(page)

    console.log(`Scraping completed in ${duration.toString()}ms`)

    return data
  }

  async function extractData(
    page: AdapterPage,
    config: ScraperConfig
  ): Promise<unknown> {
    const processor = registry.get(config.type)
    const element = await browser.root(page, config.root)

    if (!element) {
      throw new Error('failed to get root element: ' + (config.root ?? 'html'))
    }

    const result = await processor.process({
      page,
      element,
      config,
      vars,
      browser,
      registry
    })

    if (config.id) {
      vars.set(config.id, result as string)
    }

    return result
  }

  return scrape
}
