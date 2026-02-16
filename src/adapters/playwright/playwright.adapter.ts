import * as os from 'node:os'
import { chromium, type BrowserContext, type ElementHandle, type Page, type Response } from 'patchright'
import type { BrowserAdapter, NavigationWaitUntil, ResponseData } from '../../interfaces/browser-adapter.interface.js'
import type { NavigationOptions } from '../../interfaces/navigation-options.interface.js'
import type { ScraperConfig } from '../../interfaces/scraper-config.interface.js'

export class PlaywrightAdapter implements BrowserAdapter<Page, ElementHandle<SVGElement | HTMLElement>> {
  private browser: BrowserContext | null = null
  private readonly responseMap = new Map<string, ResponseData>()
  private readonly tempDir = os.tmpdir() + '/ayumi-scraper-data'

  private async getBrowser(): Promise<BrowserContext> {
    this.browser ??= await chromium.launchPersistentContext(this.tempDir, {
      channel: 'chrome',
      headless: false,
      viewport: null
    })

    return this.browser
  }

  private mapWaitUntil(waitUntil: NavigationWaitUntil): 'load' | 'domcontentloaded' | 'networkidle' {
    if (waitUntil === 'networkidle0' || waitUntil === 'networkidle2') {
      return 'networkidle'
    }

    return waitUntil
  }

  async createPage(): Promise<Page> {
    const browser = await this.getBrowser()
    const page = await browser.newPage()

    page.setDefaultNavigationTimeout(30000)
    page.setDefaultTimeout(30000)

    return page
  }

  private setupResponseTracking(page: Page): void {
    page.on('response', (response: Response) => {
      const url = response.url()
      const headers = response.headers()
      const contentType = headers['content-type'] ?? ''
      const statusCode = response.status()

      if (statusCode >= 300) {
        return
      }

      this.responseMap.set(url, {
        url,
        buffer: () => response.body(),
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

    const waitUntil = this.mapWaitUntil(config.waitFor?.type ?? 'networkidle0')
    const timeout = config.timeout ?? 30000

    const response = await page.goto(url, {
      waitUntil,
      timeout
    })

    if (!response?.ok()) {
      throw new Error(
        `Failed to load page: ${url} - status: ${response ? response.status().toString() : 'no response'}`
      )
    }
  }

  async root(page: Page, path?: string): Promise<ElementHandle<SVGElement | HTMLElement>> {
    return page.$(path ?? 'html') as Promise<ElementHandle<SVGElement | HTMLElement>>
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
    if (page.isClosed()) {
      return
    }

    if (this.browser?.pages().length === 1) {
      await this.browser.close()
      this.browser = null

      return
    }

    await page.close()
  }

  async destroy(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  async extractNodes(
    element: ElementHandle<SVGElement | HTMLElement>,
    selector: string
  ): Promise<ElementHandle<SVGElement | HTMLElement>[]> {
    return element.$$(selector)
  }

  async extractNode(
    element: ElementHandle<SVGElement | HTMLElement>,
    selector: string
  ): Promise<ElementHandle<SVGElement | HTMLElement> | null> {
    return this.extractNodes(element, selector).then((handles) => handles[0] ?? null)
  }

  async extractHtml(element: ElementHandle<SVGElement | HTMLElement>, config: ScraperConfig): Promise<string | null> {
    if (!config.path) {
      throw new Error('path is required for html extraction')
    }

    const node = await this.extractNode(element, config.path)

    if (!node) {
      return null
    }

    return node.evaluate((el) => el.outerHTML)
  }

  async extractAttribute(
    element: ElementHandle<SVGElement | HTMLElement>,
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

  async extractText(element: ElementHandle<SVGElement | HTMLElement>, config: ScraperConfig): Promise<string | null> {
    if (!config.path) {
      throw new Error('path is required for text extraction')
    }

    const node = await this.extractNode(element, config.path)

    if (!node) {
      return null
    }

    return node.evaluate((el) => el.textContent.trim())
  }
}
