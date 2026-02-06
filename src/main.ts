import {
  type ProcessorRegistry,
  createAttributeProcessor,
  createFollowProcessor,
  createHtmlProcessor,
  createImageProcessor,
  createListProcessor,
  createNumberProcessor,
  createObjectProcessor,
  createRegistry,
  createTextProcessor
} from '@processors'
import { PlaywrightAdapter } from './adapters/playwright/playwright.adapter.js'
import { createVariableContainer } from './context/vars.service.js'
import { ScraperEngine } from './engine/scraper.engine.js'
import type { BrowserAdapter } from './interfaces/browser-adapter.interface.js'

export interface ScraperContext {
  registry: ProcessorRegistry
  engine: ScraperEngine
}

export async function createScraper(
  adapter?: BrowserAdapter
): Promise<ScraperContext> {
  const browser = adapter ?? new PlaywrightAdapter()

  if ('initialize' in browser) {
    await browser.initialize?.()
  }

  const registry = createRegistry()
  const vars = createVariableContainer()

  // TODO: defer initialization of processors until they're needed, to avoid unnecessary imports and setup
  registry.set('text', createTextProcessor())
  registry.set('attribute', createAttributeProcessor())
  registry.set('html', createHtmlProcessor())
  registry.set('number', createNumberProcessor())
  registry.set('list', createListProcessor())
  registry.set('object', createObjectProcessor())
  registry.set('image', createImageProcessor())
  registry.set('follow', createFollowProcessor())

  const engine = new ScraperEngine(browser, registry, vars)

  return {
    registry,
    engine
  }
}
