import { describe, expect, it, vi } from 'vitest'
import type { AdapterElement, AdapterPage, BrowserAdapter } from '../interfaces/browser-adapter.interface.js'
import type { ScraperConfig } from '../interfaces/scraper-config.interface.js'
import type { Processor, ProcessorRegistry } from '../processors/processor.registry.js'
import type { VariableContainer } from '../utils/variable.js'
import { createScraper } from './scraper.engine.js'

function createPageStub(url = 'https://example.com'): AdapterPage {
  return {
    url: () => url,
    content: async () => Promise.resolve('')
  }
}

function createBrowserStub(page: AdapterPage): BrowserAdapter {
  return {
    root: vi.fn(),
    createPage: vi.fn().mockResolvedValue(page),
    navigateToPage: vi.fn().mockResolvedValue(undefined),
    closePage: vi.fn().mockResolvedValue(undefined),
    destroy: vi.fn().mockResolvedValue(undefined),
    extractNodes: vi.fn(),
    extractNode: vi.fn(),
    extractHtml: vi.fn(),
    extractText: vi.fn(),
    extractAttribute: vi.fn()
  }
}

function createRegistryStub(processor: Processor): ProcessorRegistry {
  return {
    set: vi.fn(),
    defer: vi.fn(),
    get: vi.fn().mockReturnValue(processor)
  }
}

function createVarsStub(): VariableContainer {
  return {
    setupPage: vi.fn(),
    restorePage: vi.fn(),
    setFromConfig: vi.fn(),
    set: vi.fn(),
    replace: vi.fn((text: string) => text),
    clear: vi.fn(),
    clone: vi.fn(() => new Map())
  }
}

describe('createScraper', () => {
  it('throws when url is missing', async () => {
    const page = createPageStub()
    const browser = createBrowserStub(page)
    const processor: Processor = { process: vi.fn() }
    const registry = createRegistryStub(processor)
    const vars = createVarsStub()
    const scrape = createScraper(browser, registry, vars)

    await expect(scrape({ type: 'text', path: '.title' } as ScraperConfig)).rejects.toThrow('url is required')
    expect(browser.createPage).not.toHaveBeenCalled()
  })

  it('navigates, processes, closes page, and returns result', async () => {
    const page = createPageStub('https://example.com/page')
    const browser = createBrowserStub(page)
    const element = {} as AdapterElement
    const processor: Processor = {
      process: vi.fn().mockResolvedValue('result-value')
    }
    const registry = createRegistryStub(processor)
    const vars = createVarsStub()
    const scrape = createScraper(browser, registry, vars)
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    const config: ScraperConfig = {
      type: 'text',
      url: 'https://example.com/page',
      path: '.title',
      root: 'body'
    }

    vi.mocked(browser.root).mockResolvedValue(element)

    const result = await scrape(config)

    expect(browser.createPage).toHaveBeenCalledTimes(1)
    expect(browser.navigateToPage).toHaveBeenCalledWith(page, {
      url: 'https://example.com/page',
      config
    })
    expect(vars.setupPage).toHaveBeenCalledWith(page)
    expect(registry.get).toHaveBeenCalledWith('text')
    expect(browser.root).toHaveBeenCalledWith(page, 'body')
    expect(processor.process).toHaveBeenCalledWith({
      page,
      element,
      config,
      vars,
      browser,
      registry
    })
    expect(browser.closePage).toHaveBeenCalledWith(page)
    expect(result).toBe('result-value')
    expect(logSpy).toHaveBeenCalledTimes(1)
    expect(logSpy.mock.calls[0][0]).toMatch(/^Scraping completed in \d+ms$/)

    logSpy.mockRestore()
  })

  it('stores result into vars when id is provided', async () => {
    const page = createPageStub()
    const browser = createBrowserStub(page)
    const element = {} as AdapterElement
    const processor: Processor = {
      process: vi.fn().mockResolvedValue('value-to-store')
    }
    const registry = createRegistryStub(processor)
    const vars = createVarsStub()
    const scrape = createScraper(browser, registry, vars)

    vi.mocked(browser.root).mockResolvedValue(element)
    vi.spyOn(console, 'log').mockImplementation(() => undefined)

    await scrape({
      type: 'text',
      url: 'https://example.com',
      path: '.title',
      id: 'savedResult'
    })

    expect(vars.set).toHaveBeenCalledWith('savedResult', 'value-to-store')
  })

  it('throws when root element cannot be resolved', async () => {
    const page = createPageStub()
    const browser = createBrowserStub(page)
    const processor: Processor = {
      process: vi.fn()
    }
    const registry = createRegistryStub(processor)
    const vars = createVarsStub()
    const scrape = createScraper(browser, registry, vars)

    vi.mocked(browser.root).mockResolvedValue(null)

    await expect(
      scrape({
        type: 'text',
        url: 'https://example.com',
        path: '.title'
      })
    ).rejects.toThrow('failed to get root element: html')

    expect(processor.process).not.toHaveBeenCalled()
  })
})
