import { describe, expect, it, vi } from 'vitest'
import type { AdapterElement, AdapterPage, BrowserAdapter } from '../interfaces/browser-adapter.interface.js'
import type { ScraperConfig } from '../interfaces/scraper-config.interface.js'
import { createVariableContainer } from '../utils/variable.js'
import { createObjectProcessor } from './object.processor.js'
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

describe('createObjectProcessor', () => {
  it('throws when props is missing', async () => {
    const processor = createObjectProcessor()

    await expect(
      processor.process({
        page: createPageStub(),
        element: {} as AdapterElement,
        config: {
          type: 'object'
        },
        vars: createVariableContainer(),
        browser: createBrowserStub(),
        registry: createRegistry()
      })
    ).rejects.toThrow('Object processor requires a "props" array with at least one property')
  })

  it('throws when a prop key is missing', async () => {
    const processor = createObjectProcessor()

    await expect(
      processor.process({
        page: createPageStub(),
        element: {} as AdapterElement,
        config: {
          type: 'object',
          props: [
            {
              type: 'text',
              path: '.title'
            }
          ]
        },
        vars: createVariableContainer(),
        browser: createBrowserStub(),
        registry: createRegistry()
      })
    ).rejects.toThrow('Each property in "props" must have a "key" field')
  })

  it('processes each prop with its processor and returns keyed object', async () => {
    const processor = createObjectProcessor()
    const registry = createRegistry()
    const textProcess = vi.fn().mockResolvedValue('Hello')
    const numberProcess = vi.fn().mockResolvedValue(42)
    const page = createPageStub()
    const element = {} as AdapterElement
    const vars = createVariableContainer()
    const browser = createBrowserStub()
    const config: ScraperConfig = {
      type: 'object',
      props: [
        {
          type: 'text',
          key: 'title',
          path: '.title'
        },
        {
          type: 'number',
          key: 'price',
          path: '.price'
        }
      ]
    }

    registry.set('text', { process: textProcess })
    registry.set('number', { process: numberProcess })

    const result = await processor.process({
      page,
      element,
      config,
      vars,
      browser,
      registry
    })

    expect(textProcess).toHaveBeenCalledTimes(1)
    expect(numberProcess).toHaveBeenCalledTimes(1)
    expect(textProcess).toHaveBeenCalledWith({
      page,
      element,
      config: config.props?.[0],
      vars,
      browser,
      registry
    })
    expect(numberProcess).toHaveBeenCalledWith({
      page,
      element,
      config: config.props?.[1],
      vars,
      browser,
      registry
    })
    expect(result).toEqual({
      title: 'Hello',
      price: 42
    })
  })
})
