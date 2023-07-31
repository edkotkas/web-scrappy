import type { PageData, ScrappyOptions } from '@models'
import type { Browser, HTTPResponse, PuppeteerLaunchOptions } from 'puppeteer'
import type { PuppeteerExtraPlugin } from 'puppeteer-extra'
import puppeteer from 'puppeteer-extra'

import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

export class PuppyService {
  private options: PuppeteerLaunchOptions = {
    headless: 'new',
    slowMo: 750
  }

  private browser?: Browser
  private pages: Record<string, PageData> = {}

  constructor(options?: ScrappyOptions) {
    this.options = Object.assign({}, this.options, options?.pup)
    this.setDefaultPlugins(options)
  }

  setDefaultPlugins(options?: ScrappyOptions): void {
    puppeteer.use(StealthPlugin())
    if (options) {
      puppeteer.use(AdblockerPlugin())
    }
  }

  usePlugins(...plugins: PuppeteerExtraPlugin[]): void {
    plugins.forEach((p) => {
      puppeteer.use(p)
    })
  }

  async init(): Promise<void> {
    this.browser ??= await puppeteer.launch(this.options)
  }

  async fetch(url: string): Promise<PageData> {
    if (!this.browser) {
      throw new Error('no browser initialized')
    }

    const page = await this.browser.newPage()

    const res: HTTPResponse[] = []
    page.on('response', (response) => {
      res.push(response)
    })

    await page.goto(url, {
      waitUntil: 'load'
    })

    const data = {
      page,
      res
    }

    this.pages[url] = data

    return data
  }

  getPage(url: string): PageData {
    return this.pages[url]
  }

  async destroyPage(url: string): Promise<void> {
    await this.pages[url].page.close()

    const { [url]: _, ...rest } = this.pages
    this.pages = rest
  }

  async destroy(): Promise<void> {
    if (!this.browser) {
      return
    }

    this.browser.process()?.kill()
    await this.browser.close()
  }
}
