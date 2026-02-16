import { describe, expect, it, vi } from 'vitest'
import type { AdapterElement, AdapterPage, BrowserAdapter } from '../interfaces/browser-adapter.interface.js'
import { createVariableContainer } from '../utils/variable.js'
import { createRegistry } from './processor.registry.js'
import { createTextProcessor } from './text.processor.js'

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

describe('createTextProcessor', () => {
  it('throws when path is missing', async () => {
    const processor = createTextProcessor()

    await expect(
      processor.process({
        page: createPageStub(),
        element: {} as AdapterElement,
        config: {
          type: 'text'
        },
        vars: createVariableContainer(),
        browser: createBrowserStub(),
        registry: createRegistry()
      })
    ).rejects.toThrow('path is required for text')
  })

  it('extracts text and formats it using config and vars', async () => {
    const processor = createTextProcessor()
    const browser = createBrowserStub()
    const element = {} as AdapterElement
    const vars = createVariableContainer()

    vars.set('prefix', '[')
    vars.set('suffix', ']')
    vi.mocked(browser.extractText).mockResolvedValue('  hello  ')

    const config = {
      type: 'text',
      path: '.title',
      trim: true,
      prepend: '${prefix}',
      append: '${suffix}'
    } as const

    const result = await processor.process({
      page: createPageStub(),
      element,
      config,
      vars,
      browser,
      registry: createRegistry()
    })

    expect(browser.extractText).toHaveBeenCalledWith(element, config)
    expect(result).toBe('[hello]')
  })

  it('returns null when text is missing and allowNull is true', async () => {
    const processor = createTextProcessor()
    const browser = createBrowserStub()

    vi.mocked(browser.extractText).mockResolvedValue(null)

    const result = await processor.process({
      page: createPageStub(),
      element: {} as AdapterElement,
      config: {
        type: 'text',
        path: '.title',
        allowNull: true
      },
      vars: createVariableContainer(),
      browser,
      registry: createRegistry()
    })

    expect(result).toBeNull()
  })

  it('throws when text is missing and allowNull is false', async () => {
    const processor = createTextProcessor()
    const browser = createBrowserStub()

    vi.mocked(browser.extractText).mockResolvedValue(null)

    await expect(
      processor.process({
        page: createPageStub(),
        element: {} as AdapterElement,
        config: {
          type: 'text',
          path: '.title'
        },
        vars: createVariableContainer(),
        browser,
        registry: createRegistry()
      })
    ).rejects.toThrow('No text found using path: .title')
  })
})
