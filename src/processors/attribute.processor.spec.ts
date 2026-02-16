import { describe, expect, it, vi } from 'vitest'
import type { AdapterElement, AdapterPage, BrowserAdapter } from '../interfaces/browser-adapter.interface.js'
import type { ScraperConfig } from '../interfaces/scraper-config.interface.js'
import { createVariableContainer } from '../utils/variable.js'
import { createAttributeProcessor } from './attribute.processor.js'
import { createRegistry } from './processor.registry.js'

function createBrowserStub(): BrowserAdapter {
  return {
    root: vi.fn(),
    createPage: vi.fn(),
    navigateToPage: vi.fn(),
    closePage: vi.fn(),
    destroy: vi.fn(),
    extractNodes: vi.fn(),
    extractNode: vi.fn(),
    extractHtml: vi.fn(),
    extractText: vi.fn(),
    extractAttribute: vi.fn()
  }
}

function createPageStub(): AdapterPage {
  return {
    url: () => 'https://example.com',
    content: async () => Promise.resolve('')
  }
}

describe('createAttributeProcessor', () => {
  it('extracts attribute and formats it using config and vars', async () => {
    const processor = createAttributeProcessor()
    const browser = createBrowserStub()
    const page = createPageStub()
    const element = {} as AdapterElement
    const vars = createVariableContainer()
    const config: ScraperConfig = {
      type: 'attribute',
      path: '.title',
      attribute: 'title',
      trim: true,
      prepend: '${prefix}',
      append: '${suffix}'
    }

    vars.set('prefix', '[')
    vars.set('suffix', ']')
    vi.mocked(browser.extractAttribute).mockResolvedValue('  hello  ')

    const result = await processor.process({
      page,
      element,
      config,
      vars,
      browser,
      registry: createRegistry()
    })

    expect(browser.extractAttribute).toHaveBeenCalledWith(element, config)
    expect(result).toBe('[hello]')
  })

  it('returns null when attribute is missing and allowNull is true', async () => {
    const processor = createAttributeProcessor()
    const browser = createBrowserStub()

    vi.mocked(browser.extractAttribute).mockResolvedValue(null)

    const result = await processor.process({
      page: createPageStub(),
      element: {} as AdapterElement,
      config: {
        type: 'attribute',
        attribute: 'href',
        path: 'a',
        allowNull: true
      },
      vars: createVariableContainer(),
      browser,
      registry: createRegistry()
    })

    expect(result).toBeNull()
  })

  it('throws when attribute is missing and allowNull is false', async () => {
    const processor = createAttributeProcessor()
    const browser = createBrowserStub()

    vi.mocked(browser.extractAttribute).mockResolvedValue(null)

    await expect(
      processor.process({
        page: createPageStub(),
        element: {} as AdapterElement,
        config: {
          type: 'attribute',
          attribute: 'href',
          path: 'a'
        },
        vars: createVariableContainer(),
        browser,
        registry: createRegistry()
      })
    ).rejects.toThrow('no attribute "href" found using path: a')
  })
})
