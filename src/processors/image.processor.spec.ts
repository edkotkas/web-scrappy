import { describe, expect, it, vi } from 'vitest'
import type {
  AdapterElement,
  AdapterPage,
  BrowserAdapter,
  ResponseData
} from '../interfaces/browser-adapter.interface.js'
import type { ScraperConfig } from '../interfaces/scraper-config.interface.js'
import { createVariableContainer } from '../utils/variable.js'
import { createImageProcessor } from './image.processor.js'
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
    extractAttribute: vi.fn(),
    getResponse: vi.fn()
  }
}

function createPageStub(): AdapterPage {
  return {
    url: () => 'https://example.com',
    content: async () => Promise.resolve('')
  }
}

function createResponse(buffer: Buffer): ResponseData {
  return {
    url: 'https://cdn.example.com/img.jpg',
    buffer: async () => Promise.resolve(buffer),
    contentType: 'image/jpeg',
    statusCode: 200,
    headers: {}
  }
}

describe('createImageProcessor', () => {
  it('uses config.attribute first when provided and returns image buffer', async () => {
    const processor = createImageProcessor()
    const browser = createBrowserStub()
    const image = Buffer.from('img')

    vi.mocked(browser.extractAttribute).mockResolvedValue('https://cdn.example.com/custom.jpg')
    vi.mocked(browser.getResponse as () => ResponseData).mockReturnValue(createResponse(image))

    const config = {
      type: 'image',
      path: '.cover',
      attribute: 'data-image'
    } as const

    const result = await processor.process({
      page: createPageStub(),
      element: {} as AdapterElement,
      config,
      vars: createVariableContainer(),
      browser,
      registry: createRegistry()
    })

    expect(browser.extractAttribute).toHaveBeenCalledTimes(1)
    expect(browser.extractAttribute).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ attribute: 'data-image' })
    )
    expect(browser.getResponse).toHaveBeenCalledWith('https://cdn.example.com/custom.jpg', 'image/')
    expect(result).toEqual(image)
  })

  it('falls back to src when custom attribute is missing', async () => {
    const processor = createImageProcessor()
    const browser = createBrowserStub()
    const image = Buffer.from('src-image')
    const calledAttributes: (string | undefined)[] = []

    vi.mocked(browser.extractAttribute).mockImplementation(async (_element, config) => {
      calledAttributes.push(config.attribute)

      if (calledAttributes.length === 1) {
        return null
      }

      return Promise.resolve('https://cdn.example.com/src.jpg')
    })
    vi.mocked(browser.getResponse as () => ResponseData).mockReturnValue(createResponse(image))

    const config = {
      type: 'image',
      path: '.cover',
      attribute: 'data-image'
    } as ScraperConfig

    const result = await processor.process({
      page: createPageStub(),
      element: {} as AdapterElement,
      config,
      vars: createVariableContainer(),
      browser,
      registry: createRegistry()
    })

    expect(browser.extractAttribute).toHaveBeenCalledTimes(2)
    expect(calledAttributes).toEqual(['data-image', 'src'])
    expect(result).toEqual(image)
  })

  it('falls back to data-src when src is missing', async () => {
    const processor = createImageProcessor()
    const browser = createBrowserStub()
    const image = Buffer.from('data-src-image')

    vi.mocked(browser.extractAttribute)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('https://cdn.example.com/data-src.jpg')
    vi.mocked(browser.getResponse as () => ResponseData).mockReturnValue(createResponse(image))

    const result = await processor.process({
      page: createPageStub(),
      element: {} as AdapterElement,
      config: {
        type: 'image',
        path: '.cover',
        attribute: 'data-image'
      },
      vars: createVariableContainer(),
      browser,
      registry: createRegistry()
    })

    expect(browser.extractAttribute).toHaveBeenCalledTimes(3)
    expect(browser.extractAttribute).toHaveBeenNthCalledWith(
      3,
      expect.anything(),
      expect.objectContaining({ attribute: 'data-src' })
    )
    expect(result).toEqual(image)
  })

  it('returns null when source exists but response is not available', async () => {
    const processor = createImageProcessor()
    const browser = createBrowserStub()

    vi.mocked(browser.extractAttribute).mockResolvedValue('https://cdn.example.com/src.jpg')
    vi.mocked(browser.getResponse as () => ResponseData | undefined).mockReturnValue(undefined)

    const result = await processor.process({
      page: createPageStub(),
      element: {} as AdapterElement,
      config: {
        type: 'image',
        path: '.cover',
        attribute: 'src'
      },
      vars: createVariableContainer(),
      browser,
      registry: createRegistry()
    })

    expect(result).toBeNull()
  })

  it('returns null when no source is found and allowNull is true', async () => {
    const processor = createImageProcessor()
    const browser = createBrowserStub()

    vi.mocked(browser.extractAttribute).mockResolvedValue(null)

    const result = await processor.process({
      page: createPageStub(),
      element: {} as AdapterElement,
      config: {
        type: 'image',
        path: '.cover',
        allowNull: true
      },
      vars: createVariableContainer(),
      browser,
      registry: createRegistry()
    })

    expect(result).toBeNull()
  })

  it('throws when no source is found and allowNull is false', async () => {
    const processor = createImageProcessor()
    const browser = createBrowserStub()

    vi.mocked(browser.extractAttribute).mockResolvedValue(null)

    await expect(
      processor.process({
        page: createPageStub(),
        element: {} as AdapterElement,
        config: {
          type: 'image',
          path: '.cover'
        },
        vars: createVariableContainer(),
        browser,
        registry: createRegistry()
      })
    ).rejects.toThrow('no image source found for element at path: .cover')
  })
})
