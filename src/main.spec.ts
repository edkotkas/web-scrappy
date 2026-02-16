import { describe, expect, it, vi } from 'vitest'
import type { BrowserAdapter } from './interfaces/browser-adapter.interface.js'
import { createScraperEngine } from './main.js'

function createAdapterStub(): BrowserAdapter {
  return {
    initialize: vi.fn().mockResolvedValue(undefined),
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

describe('createScraperEngine', () => {
  it('initializes the adapter when available', async () => {
    const adapter = createAdapterStub()

    await createScraperEngine({ adapter })

    expect(adapter.initialize).toHaveBeenCalledTimes(1)
  })

  it('creates a registry with deferred processors', async () => {
    const adapter = createAdapterStub()

    const context = await createScraperEngine({ adapter })

    const types = ['text', 'attribute', 'html', 'number', 'list', 'object', 'image', 'follow']

    for (const type of types) {
      const processor = context.registry.get(type)

      expect(processor).toBeDefined()
      expect(typeof processor.process).toBe('function')
    }
  })

  it('does not require an initialize function', async () => {
    const { initialize, ...adapter } = createAdapterStub()

    const context = await createScraperEngine({ adapter })

    expect(context.scrape).toBeTypeOf('function')
    expect(initialize).not.toHaveBeenCalled()
  })
})
