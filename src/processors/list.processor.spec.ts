import { describe, expect, it, vi } from 'vitest'
import type { AdapterElement, AdapterPage, BrowserAdapter } from '../interfaces/browser-adapter.interface.js'
import { createVariableContainer } from '../utils/variable.js'
import { createListProcessor } from './list.processor.js'
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

describe('createListProcessor', () => {
  it('throws when nested config is missing', async () => {
    const processor = createListProcessor()

    await expect(
      processor.process({
        page: createPageStub(),
        element: {} as AdapterElement,
        config: {
          type: 'list',
          path: '.item'
        },
        vars: createVariableContainer(),
        browser: createBrowserStub(),
        registry: createRegistry()
      })
    ).rejects.toThrow('config is required for list')
  })

  it('throws when path is missing', async () => {
    const processor = createListProcessor()

    await expect(
      processor.process({
        page: createPageStub(),
        element: {} as AdapterElement,
        config: {
          type: 'list',
          config: {
            type: 'text'
          }
        },
        vars: createVariableContainer(),
        browser: createBrowserStub(),
        registry: createRegistry()
      })
    ).rejects.toThrow('path is required for list')
  })

  it('extracts nodes and runs nested processor for each node', async () => {
    const processor = createListProcessor()
    const browser = createBrowserStub()
    const registry = createRegistry()
    const childProcess = vi.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second')
    const nodeA = {} as AdapterElement
    const nodeB = {} as AdapterElement
    const page = createPageStub()
    const vars = createVariableContainer()
    const parentElement = {} as AdapterElement
    const nestedConfig = {
      type: 'text',
      path: '.title'
    } as const

    registry.set('text', { process: childProcess })
    vi.mocked(browser.extractNodes).mockResolvedValue([nodeA, nodeB])

    const result = await processor.process({
      page,
      element: parentElement,
      config: {
        type: 'list',
        path: '.item',
        config: nestedConfig
      },
      vars,
      browser,
      registry
    })

    expect(browser.extractNodes).toHaveBeenCalledWith(parentElement, '.item')
    expect(childProcess).toHaveBeenCalledTimes(2)
    expect(childProcess).toHaveBeenNthCalledWith(1, {
      page,
      element: nodeA,
      config: nestedConfig,
      vars,
      browser,
      registry
    })
    expect(childProcess).toHaveBeenNthCalledWith(2, {
      page,
      element: nodeB,
      config: nestedConfig,
      vars,
      browser,
      registry
    })
    expect(result).toEqual(['first', 'second'])
  })

  it('returns an empty list when no nodes are found', async () => {
    const processor = createListProcessor()
    const browser = createBrowserStub()
    const registry = createRegistry()
    const childProcess = vi.fn()

    registry.set('text', { process: childProcess })
    vi.mocked(browser.extractNodes).mockResolvedValue([])

    const result = await processor.process({
      page: createPageStub(),
      element: {} as AdapterElement,
      config: {
        type: 'list',
        path: '.item',
        config: {
          type: 'text',
          path: '.title'
        }
      },
      vars: createVariableContainer(),
      browser,
      registry
    })

    expect(result).toEqual([])
    expect(childProcess).not.toHaveBeenCalled()
  })
})
