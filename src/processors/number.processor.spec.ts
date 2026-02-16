import { describe, expect, it, vi } from 'vitest'
import type { AdapterElement, AdapterPage, BrowserAdapter } from '../interfaces/browser-adapter.interface.js'
import { createVariableContainer } from '../utils/variable.js'
import { createNumberProcessor } from './number.processor.js'
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

describe('createNumberProcessor', () => {
  it('throws when path is missing', async () => {
    const processor = createNumberProcessor()

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
    ).rejects.toThrow('path is required for number')
  })

  it('extracts text and returns parsed number', async () => {
    const processor = createNumberProcessor()
    const browser = createBrowserStub()
    const element = {} as AdapterElement

    vi.mocked(browser.extractText).mockResolvedValue('42.5')

    const config = {
      type: 'text',
      path: '.price'
    } as const

    const result = await processor.process({
      page: createPageStub(),
      element,
      config,
      vars: createVariableContainer(),
      browser,
      registry: createRegistry()
    })

    expect(browser.extractText).toHaveBeenCalledWith(element, config)
    expect(result).toBe(42.5)
  })

  it('applies formatting before number conversion', async () => {
    const processor = createNumberProcessor()
    const browser = createBrowserStub()
    const vars = createVariableContainer()

    vars.set('value', '123')
    vi.mocked(browser.extractText).mockResolvedValue('ignored')

    const result = await processor.process({
      page: createPageStub(),
      element: {} as AdapterElement,
      config: {
        type: 'text',
        path: '.price',
        pattern: {
          match: 'ignored',
          replace: '${value}'
        }
      },
      vars,
      browser,
      registry: createRegistry()
    })

    expect(result).toBe(123)
  })

  it('returns null when text is missing and allowNull is true', async () => {
    const processor = createNumberProcessor()
    const browser = createBrowserStub()

    vi.mocked(browser.extractText).mockResolvedValue(null)

    const result = await processor.process({
      page: createPageStub(),
      element: {} as AdapterElement,
      config: {
        type: 'text',
        path: '.price',
        allowNull: true
      },
      vars: createVariableContainer(),
      browser,
      registry: createRegistry()
    })

    expect(result).toBeNull()
  })

  it('throws when formatted value is not a valid number', async () => {
    const processor = createNumberProcessor()
    const browser = createBrowserStub()

    vi.mocked(browser.extractText).mockResolvedValue('abc')

    await expect(
      processor.process({
        page: createPageStub(),
        element: {} as AdapterElement,
        config: {
          type: 'text',
          path: '.price'
        },
        vars: createVariableContainer(),
        browser,
        registry: createRegistry()
      })
    ).rejects.toThrow('value is not a valid number: abc -> abc')
  })
})
