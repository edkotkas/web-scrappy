import type { ElementHandle, HTTPResponse, Page } from 'puppeteer'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ScraperConfig } from '../../interfaces/scraper-config.interface.js'
import { PuppeteerAdapter } from './puppeteer.adapter.js'

type TrackedResponse = Pick<HTTPResponse, 'url' | 'headers' | 'status' | 'buffer'>

describe('PuppeteerAdapter', () => {
  let adapter: PuppeteerAdapter

  beforeEach(() => {
    adapter = new PuppeteerAdapter()
  })

  it('navigates with configured waitUntil and timeout', async () => {
    const page = {
      on: vi.fn(),
      setDefaultNavigationTimeout: vi.fn(),
      setDefaultTimeout: vi.fn(),
      goto: vi.fn().mockResolvedValue({ ok: () => true }),
      waitForFunction: vi.fn().mockResolvedValue(undefined)
    } as unknown as Page

    await adapter.navigateToPage(page, {
      url: 'https://example.com',
      config: {
        type: 'text',
        timeout: 1234,
        waitFor: { type: 'domcontentloaded' }
      }
    })

    expect(page.setDefaultNavigationTimeout).toHaveBeenCalledWith(1234)
    expect(page.setDefaultTimeout).toHaveBeenCalledWith(1234)
    expect(page.goto).toHaveBeenCalledWith('https://example.com', {
      waitUntil: 'domcontentloaded',
      timeout: 1234
    })
    expect(page.waitForFunction).toHaveBeenCalledWith(expect.any(Function), expect.objectContaining({ timeout: 1234 }))
  })

  it('tracks successful responses and filters by content type', async () => {
    let responseHandler: ((response: TrackedResponse) => void) | undefined
    const page = {
      on: vi.fn((event: string, handler: (response: TrackedResponse) => void) => {
        if (event === 'response') {
          responseHandler = handler
        }
      }),
      setDefaultNavigationTimeout: vi.fn(),
      setDefaultTimeout: vi.fn(),
      goto: vi.fn().mockResolvedValue({ ok: () => true }),
      waitForFunction: vi.fn().mockResolvedValue(undefined)
    } as unknown as Page
    const body = Buffer.from('image')

    await adapter.navigateToPage(page, {
      url: 'https://example.com',
      config: { type: 'text' }
    })

    responseHandler?.({
      url: () => 'https://cdn.example.com/image.jpg',
      headers: () => ({ 'content-type': 'image/jpeg' }),
      status: () => 200,
      buffer: async () => Promise.resolve(body)
    })

    const response = adapter.getResponse('https://cdn.example.com/image.jpg', 'image/')

    expect(response).toBeDefined()
    expect(response?.contentType).toBe('image/jpeg')
    await expect(response?.buffer()).resolves.toEqual(body)
    expect(adapter.getResponse('https://cdn.example.com/image.jpg', 'text/')).toBeUndefined()
  })

  it('throws when navigation response is not ok', async () => {
    const page = {
      on: vi.fn(),
      setDefaultNavigationTimeout: vi.fn(),
      setDefaultTimeout: vi.fn(),
      goto: vi.fn().mockResolvedValue({ ok: () => false, status: () => 500 }),
      waitForFunction: vi.fn().mockResolvedValue(undefined)
    } as unknown as Page

    await expect(
      adapter.navigateToPage(page, {
        url: 'https://example.com',
        config: { type: 'text' }
      })
    ).rejects.toThrow('Failed to load page: https://example.com - status: 500')
  })

  it('finds root element with default selector', async () => {
    const root = { id: 'root' }
    const page = {
      waitForSelector: vi.fn().mockResolvedValue(root)
    } as unknown as Page

    const result = await adapter.root(page)

    expect(page.waitForSelector).toHaveBeenCalledWith('html')
    expect(result).toBe(root)
  })

  it('closes browser context when closing the last page', async () => {
    const page = {
      isClosed: vi.fn().mockReturnValue(false),
      close: vi.fn()
    } as unknown as Page
    const context = {
      pages: vi.fn().mockResolvedValue([page]),
      close: vi.fn().mockResolvedValue(undefined)
    }

    vi.spyOn(adapter as unknown as { getBrowser: () => Promise<unknown> }, 'getBrowser').mockResolvedValue(context)

    await adapter.closePage(page)

    expect(context.close).toHaveBeenCalledTimes(1)
    expect(page.close).not.toHaveBeenCalled()
  })

  it('extractNodes throws when selector is not found', async () => {
    const element = {
      waitForSelector: vi.fn().mockResolvedValue(null)
    } as unknown as ElementHandle

    await expect(adapter.extractNodes(element, '.item')).rejects.toThrow('failed to find element with selector: .item')
  })

  it('extractHtml returns element outerHTML when path is not provided', async () => {
    const element = {
      evaluate: vi.fn().mockResolvedValue('<div>content</div>')
    } as unknown as ElementHandle

    const result = await adapter.extractHtml(element, { type: 'html' } as ScraperConfig)

    expect(result).toBe('<div>content</div>')
  })

  it('extractText supports xpath selector conversion', async () => {
    const node = {
      evaluate: vi.fn().mockResolvedValue('title')
    } as unknown as ElementHandle

    vi.spyOn(adapter, 'extractNode').mockResolvedValue(node)

    const result = await adapter.extractText({} as ElementHandle, {
      type: 'text',
      path: '//h1',
      pathType: 'xpath'
    })

    expect(adapter.extractNode).toHaveBeenCalledWith({} as ElementHandle, '::-p-xpath(//h1)')
    expect(result).toBe('title')
  })
})
