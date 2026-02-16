import type { ElementHandle, Page, Response } from 'patchright'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ScraperConfig } from '../../interfaces/scraper-config.interface.js'
import { PlaywrightAdapter } from './playwright.adapter.js'

type TrackedResponse = Pick<Response, 'url' | 'headers' | 'status' | 'body'>

describe('PlaywrightAdapter', () => {
  let adapter: PlaywrightAdapter

  beforeEach(() => {
    adapter = new PlaywrightAdapter()
  })

  it('navigates with mapped waitUntil and timeout', async () => {
    const page = {
      on: vi.fn(),
      setDefaultNavigationTimeout: vi.fn(),
      setDefaultTimeout: vi.fn(),
      goto: vi.fn().mockResolvedValue({ ok: () => true }),
      $: vi.fn()
    } as unknown as Page

    await adapter.navigateToPage(page, {
      url: 'https://example.com',
      config: {
        type: 'text',
        timeout: 1234,
        waitFor: { type: 'networkidle2' }
      }
    })

    expect(page.setDefaultNavigationTimeout).toHaveBeenCalledWith(1234)
    expect(page.setDefaultTimeout).toHaveBeenCalledWith(1234)
    expect(page.goto).toHaveBeenCalledWith('https://example.com', {
      waitUntil: 'networkidle',
      timeout: 1234
    })
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
      $: vi.fn()
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
      body: async () => Promise.resolve(body)
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
      $: vi.fn()
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
      $: vi.fn().mockResolvedValue(root)
    } as unknown as Page

    const result = await adapter.root(page)

    expect(page.$).toHaveBeenCalledWith('html')
    expect(result).toBe(root)
  })

  it('closes browser context when closing the last page', async () => {
    const page = {
      isClosed: vi.fn().mockReturnValue(false),
      close: vi.fn()
    } as unknown as Page

    const context = {
      pages: vi.fn().mockReturnValue([page]),
      close: vi.fn().mockResolvedValue(undefined)
    }

    ;(adapter as unknown as { browser: unknown }).browser = context

    await adapter.closePage(page)

    expect(context.close).toHaveBeenCalledTimes(1)
    expect(page.close).not.toHaveBeenCalled()
  })

  it('extractHtml throws when path is not provided', async () => {
    await expect(
      adapter.extractHtml({} as ElementHandle<SVGElement | HTMLElement>, { type: 'html' } as ScraperConfig)
    ).rejects.toThrow('path is required for html extraction')
  })

  it('extractText returns null when node is missing', async () => {
    vi.spyOn(adapter, 'extractNode').mockResolvedValue(null)

    const result = await adapter.extractText({} as ElementHandle<SVGElement | HTMLElement>, {
      type: 'text',
      path: '.title'
    })

    expect(result).toBeNull()
  })
})
