import { describe, expect, it, vi } from 'vitest'
import type { AdapterElement, AdapterPage, BrowserAdapter } from '../interfaces/browser-adapter.interface.js'
import { createVariableContainer } from '../utils/variable.js'
import { createFollowProcessor } from './follow.processor.js'
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

function createMutablePage(initialUrl: string): AdapterPage & { setUrl: (url: string) => void } {
  let currentUrl = initialUrl

  return {
    url: () => currentUrl,
    content: async () => Promise.resolve(''),
    setUrl: (url: string) => {
      currentUrl = url
    }
  }
}

describe('createFollowProcessor', () => {
  it('throws when path is missing', async () => {
    const processor = createFollowProcessor()

    await expect(
      processor.process({
        page: createMutablePage('https://example.com/start'),
        element: {} as AdapterElement,
        config: {
          type: 'follow',
          attribute: 'href'
        },
        vars: createVariableContainer(),
        browser: createBrowserStub(),
        registry: createRegistry()
      })
    ).rejects.toThrow('path is required for follow')
  })

  it('throws when nested config is missing', async () => {
    const processor = createFollowProcessor()

    await expect(
      processor.process({
        page: createMutablePage('https://example.com/start'),
        element: {} as AdapterElement,
        config: {
          type: 'follow',
          path: 'a',
          attribute: 'href'
        },
        vars: createVariableContainer(),
        browser: createBrowserStub(),
        registry: createRegistry()
      })
    ).rejects.toThrow('config is required for follow')
  })

  it('throws when attribute is missing', async () => {
    const processor = createFollowProcessor()

    await expect(
      processor.process({
        page: createMutablePage('https://example.com/start'),
        element: {} as AdapterElement,
        config: {
          type: 'follow',
          path: 'a',
          config: {
            type: 'text',
            path: '.title'
          }
        },
        vars: createVariableContainer(),
        browser: createBrowserStub(),
        registry: createRegistry()
      })
    ).rejects.toThrow('attribute is required for follow')
  })

  it('returns null when follow attribute is missing and allowNull is true', async () => {
    const processor = createFollowProcessor()
    const browser = createBrowserStub()

    vi.mocked(browser.extractAttribute).mockResolvedValue(null)

    const result = await processor.process({
      page: createMutablePage('https://example.com/start'),
      element: {} as AdapterElement,
      config: {
        type: 'follow',
        path: 'a',
        attribute: 'href',
        allowNull: true,
        config: {
          type: 'text',
          path: '.title'
        }
      },
      vars: createVariableContainer(),
      browser,
      registry: createRegistry()
    })

    expect(result).toBeNull()
  })

  it('navigates, runs nested processor, and restores page-derived vars', async () => {
    const processor = createFollowProcessor()
    const browser = createBrowserStub()
    const registry = createRegistry()
    const page = createMutablePage('https://example.com/start')
    const vars = createVariableContainer()
    const element = {} as AdapterElement
    const childProcess = vi.fn().mockResolvedValue('nested-result')

    vars.setupPage(page)
    vi.mocked(browser.extractAttribute).mockResolvedValue('/target')
    vi.mocked(browser.navigateToPage).mockImplementation(async (_page, options) => {
      page.setUrl(options.url)

      return Promise.resolve()
    })
    registry.set('text', { process: childProcess })

    const nestedConfig = {
      type: 'text',
      path: '.title',
      vars: {
        label: 'inside'
      }
    } as const

    const result = await processor.process({
      page,
      element,
      config: {
        type: 'follow',
        path: 'a',
        attribute: 'href',
        config: nestedConfig
      },
      vars,
      browser,
      registry
    })

    expect(browser.extractAttribute).toHaveBeenCalledWith(
      element,
      expect.objectContaining({ type: 'follow', path: 'a', attribute: 'href' })
    )
    expect(browser.navigateToPage).toHaveBeenCalledWith(page, {
      url: 'https://example.com/target',
      config: nestedConfig
    })
    expect(childProcess).toHaveBeenCalledTimes(1)
    expect(childProcess).toHaveBeenCalledWith({
      page,
      element,
      config: nestedConfig,
      vars,
      browser,
      registry
    })
    expect(result).toBe('nested-result')
    expect(vars.replace('${pathname}')).toBe('/start')
  })
})
