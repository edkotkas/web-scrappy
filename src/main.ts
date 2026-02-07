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

  registry.defer('text', createTextProcessor)
  registry.defer('attribute', createAttributeProcessor)
  registry.defer('html', createHtmlProcessor)
  registry.defer('number', createNumberProcessor)
  registry.defer('list', createListProcessor)
  registry.defer('object', createObjectProcessor)
  registry.defer('image', createImageProcessor)
  registry.defer('follow', createFollowProcessor)

  const engine = new ScraperEngine(browser, registry, vars)

  return {
    registry,
    engine
  }
}
