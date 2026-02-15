import { PlaywrightAdapter } from './adapters/playwright/playwright.adapter.js'
import { createScraper, type ScrapeFunc } from './engine/scraper.engine.js'
import type { BrowserAdapter } from './interfaces/browser-adapter.interface.js'
import {
  createAttributeProcessor,
  createFollowProcessor,
  createHtmlProcessor,
  createImageProcessor,
  createListProcessor,
  createNumberProcessor,
  createObjectProcessor,
  createRegistry,
  createTextProcessor,
  type ProcessorRegistry
} from './processors/index.js'
import { createVariableContainer } from './utils/variable.js'

export interface ScraperContext {
  registry: ProcessorRegistry
  scrape: ScrapeFunc
}

export interface ScraperOptions {
  adapter?: BrowserAdapter
}

export async function createScraperEngine({ adapter }: ScraperOptions = {}): Promise<ScraperContext> {
  const browser = adapter ?? new PlaywrightAdapter()

  if ('initialize' in browser) {
    await browser.initialize?.()
  }

  const registry = createRegistry()
  const vars = createVariableContainer()

  registry.defer('text', createTextProcessor)
  registry.defer('attribute', createAttributeProcessor)
  registry.defer('html', createHtmlProcessor)
  registry.defer('number', createNumberProcessor)
  registry.defer('list', createListProcessor)
  registry.defer('object', createObjectProcessor)
  registry.defer('image', createImageProcessor)
  registry.defer('follow', createFollowProcessor)

  const scrape = createScraper(browser, registry, vars)

  return {
    registry,
    scrape
  }
}
