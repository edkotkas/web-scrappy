import { PuppeteerBlocker } from '@ghostery/adblocker-puppeteer'
import puppeteer, {
  Page,
  type BrowserContext,
  type ElementHandle
} from 'puppeteer'
import type {
  BrowserAdapter,
  ResponseData
} from '../../interfaces/browser-adapter.interface.js'
import type { NavigationOptions } from '../../interfaces/navigation-options.interface.js'
import type { ScraperConfig } from '../../interfaces/scraper-config.interface.js'

export class PuppeteerAdapter implements BrowserAdapter<
  Page,
  ElementHandle | null
> {
  private browser: BrowserContext | null = null
  private adBlocker: PuppeteerBlocker | null = null

  private readonly responseMap = new Map<string, ResponseData>()

  async initialize(): Promise<void> {
    this.adBlocker = await PuppeteerBlocker.fromPrebuiltAdsAndTracking()
  }

  private async getBrowser(): Promise<BrowserContext> {
    if (!this.browser) {
      const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null
      })

      this.browser = await browser.createBrowserContext()
    }

    return this.browser
  }

  async createPage(): Promise<Page> {
    const browser = await this.getBrowser()
    const page = await browser.newPage()

    await page.setViewport(null)

    page.setDefaultNavigationTimeout(30000)
    page.setDefaultTimeout(30000)

    if (this.adBlocker) {
      await this.adBlocker.enableBlockingInPage(page)
    }

    return page
  }

  private setupResponseTracking(page: Page): void {
    page.on('response', (response) => {
      const url = response.url()
      const headers = response.headers()
      const contentType = (headers['content-type'] as string | undefined) ?? ''
      const statusCode = response.status()

      if (statusCode >= 300) {
        return
      }

      this.responseMap.set(url, {
        url,
        buffer: () => response.buffer(),
        contentType,
        statusCode,
        headers
      })
    })
  }

  async navigateToPage(page: Page, options: NavigationOptions): Promise<void> {
    this.setupResponseTracking(page)

    const { url, config } = options

    if (config.timeout) {
      page.setDefaultNavigationTimeout(config.timeout)
      page.setDefaultTimeout(config.timeout)
    }

    const waitUntil = config.waitFor?.type ?? 'networkidle0'
    const timeout = config.timeout ?? 30000

    const response = await page.goto(url, {
      waitUntil,
      timeout
    })

    await page.waitForFunction(() => document.readyState === 'complete', {
      timeout
    })

    if (!response?.ok()) {
      throw new Error(
        `Failed to load page: ${url} - status: ${response ? response.status().toString() : 'no response'}`
      )
    }
  }

  async root(page: Page, path?: string): Promise<ElementHandle | null> {
    console.log(`Finding root element with selector: ${path ?? 'html'}`)

    return page.waitForSelector(path ?? 'html')
  }
  getResponse(url: string, contentType?: string): ResponseData | undefined {
    const response = this.responseMap.get(url)

    if (!response) {
      return undefined
    }

    if (contentType && !response.contentType.includes(contentType)) {
      return undefined
    }

    return response
  }

  async closePage(page: Page): Promise<void> {
    if (!page.isClosed()) {
      await page.close()
    }
  }

  async destroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  async extractNodes(
    element: ElementHandle,
    selector: string
  ): Promise<ElementHandle[]> {
    // fix no text found
    const wait = await element.waitForSelector(selector)

    if (!wait) {
      throw new Error(`failed to find element with selector: ${selector}`)
    }

    return wait.$$('*') // wait for any child element to ensure the node is fully loaded
  }

  async extractNode(
    element: ElementHandle,
    selector: string
  ): Promise<ElementHandle | null> {
    return this.extractNodes(element, selector).then(
      (handles) => handles[0] ?? null
    )
  }

  async extractHtml(
    element: ElementHandle,
    config: ScraperConfig
  ): Promise<string | null> {
    if (!config.path) {
      return element.evaluate((el) => el.outerHTML)
    }

    const node = await this.extractNode(element, config.path)

    if (!node) {
      return null
    }

    return node.evaluate((el) => el.outerHTML)
  }

  async extractAttribute(
    element: ElementHandle,
    config: ScraperConfig
  ): Promise<string | null> {
    if (!config.path) {
      throw new Error('path is required for attribute extraction')
    }

    if (!config.attribute) {
      throw new Error('attribute is required for attribute extraction')
    }

    const node = await this.extractNode(element, config.path)

    if (!node) {
      return null
    }

    return node.evaluate((el, attr) => el.getAttribute(attr), config.attribute)
  }

  async extractText(
    element: ElementHandle,
    config: ScraperConfig
  ): Promise<string | null> {
    if (!config.path) {
      throw new Error('path is required for text extraction')
    }

    const selector =
      config.pathType === 'xpath' ? `::-p-xpath(${config.path})` : config.path

    const node = await this.extractNode(element, selector)

    if (!node) {
      return null
    }

    return node.evaluate((el) => el.textContent.trim())
  }
}
