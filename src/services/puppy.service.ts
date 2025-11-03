import { VarsEnum, type PageData, type ScrappyOptions } from '@models'
import type { Browser, HTTPResponse, PuppeteerLaunchOptions } from 'puppeteer'
import type { PuppeteerExtraPlugin } from 'puppeteer-extra'
import { PuppeteerExtra } from 'puppeteer-extra'

import { PuppeteerExtraPluginAdblocker } from 'puppeteer-extra-plugin-adblocker'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import type { ContextService } from './context.service.js'

export class PuppyService {
  private options: PuppeteerLaunchOptions = {
    headless: 'new',
    timeout: 0,
    protocolTimeout: 0
  }

  private browser?: Browser
  private readonly context: ContextService
  private readonly puppeteer: PuppeteerExtra

  constructor(context: ContextService, options?: ScrappyOptions) {
    this.puppeteer = new PuppeteerExtra()
    this.context = context
    this.options = Object.assign({}, this.options, options?.pup)
    this.setDefaultPlugins(options)
  }

  private setDefaultPlugins(options?: ScrappyOptions): void {
    this.puppeteer.use(StealthPlugin())
    if (options?.adblock) {
      this.puppeteer.use(PuppeteerExtraPluginAdblocker())
    }
  }

  usePlugins(...plugins: PuppeteerExtraPlugin[]): void {
    plugins.forEach((p) => {
      this.puppeteer.use(p)
    })
  }

  async init(): Promise<void> {
    this.browser ??= await this.puppeteer.launch(this.options)
  }

  async fetch(url: string): Promise<PageData> {
    if (!this.browser) {
      throw new Error('no browser initialized')
    }

    const urlObj = new URL(url)
    this.setUrlVars(urlObj)

    const page = await this.browser.newPage()

    const res: HTTPResponse[] = []
    page.on('response', (response) => {
      res.push(response)
    })

    const response = await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 0
    })

    if (!response?.ok()) {
      throw new Error(
        `failed to fetch '${url}' with status ${
          response?.status() ?? 'unknown'
        }`
      )
    }

    const data = {
      page,
      res
    }

    return data
  }

  private setUrlVars(urlObj: URL) {
    this.context.setVar(VarsEnum.ORIGIN, urlObj.origin)
    this.context.setVar(VarsEnum.HOST, urlObj.host)
    this.context.setVar(VarsEnum.HOSTNAME, urlObj.hostname)
    this.context.setVar(VarsEnum.PATHNAME, urlObj.pathname)
    this.context.setVar(VarsEnum.PORT, urlObj.port)
    this.context.setVar(VarsEnum.PROTOCOL, urlObj.protocol)
    this.context.setVar(VarsEnum.SEARCH, urlObj.search)
  }

  async destroy(): Promise<void> {
    if (!this.browser) {
      return
    }

    this.browser.process()?.kill()
    await this.browser.close()
  }

  wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(() => resolve(), ms))
  }
}
