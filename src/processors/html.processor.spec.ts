import { describe, expect, it, vi } from 'vitest'
import type { AdapterElement, AdapterPage, BrowserAdapter } from '../interfaces/browser-adapter.interface.js'
import { createVariableContainer } from '../utils/variable.js'
import { createHtmlProcessor } from './html.processor.js'
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

describe('createHtmlProcessor', () => {
  it('extracts html and formats it using config and vars', async () => {
    const processor = createHtmlProcessor()
    const browser = createBrowserStub()
    const element = {} as AdapterElement
    const vars = createVariableContainer()

    vars.set('prefix', '<')
    vars.set('suffix', '>')
    vi.mocked(browser.extractHtml).mockResolvedValue('  value  ')

    const result = await processor.process({
      page: createPageStub(),
      element,
      config: {
        type: 'html',
        path: '.content',
        trim: true,
        prepend: '${prefix}',
        append: '${suffix}'
      },
      vars,
      browser,
      registry: createRegistry()
    })

    expect(browser.extractHtml).toHaveBeenCalledWith(element, {
      type: 'html',
      path: '.content',
      trim: true,
      prepend: '${prefix}',
      append: '${suffix}'
    })
    expect(result).toBe('<value>')
  })

  it('returns null when html is missing and allowNull is true', async () => {
    const processor = createHtmlProcessor()
    const browser = createBrowserStub()

    vi.mocked(browser.extractHtml).mockResolvedValue(null)

    const result = await processor.process({
      page: createPageStub(),
      element: {} as AdapterElement,
      config: {
        type: 'html',
        path: '.content',
        allowNull: true
      },
      vars: createVariableContainer(),
      browser,
      registry: createRegistry()
    })

    expect(result).toBeNull()
  })

  it('throws when html is missing and allowNull is false', async () => {
    const processor = createHtmlProcessor()
    const browser = createBrowserStub()

    vi.mocked(browser.extractHtml).mockResolvedValue(null)

    await expect(
      processor.process({
        page: createPageStub(),
        element: {} as AdapterElement,
        config: {
          type: 'html',
          path: '.content'
        },
        vars: createVariableContainer(),
        browser,
        registry: createRegistry()
      })
    ).rejects.toThrow('no html found using path: .content')
  })
})
