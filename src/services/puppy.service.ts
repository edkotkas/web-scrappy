import type { Browser, HTTPResponse, Page, PuppeteerLaunchOptions } from 'puppeteer'
import { launch } from 'puppeteer'

export class PuppyService {
  private _options: PuppeteerLaunchOptions = {
    headless: 'new'
  }
  
  private pup?: Browser
  private page?: Page
  private content?: HTTPResponse | null

  constructor(
    private options?: PuppeteerLaunchOptions
  ) {
    this.options ??= this._options
  }

  async setup(): Promise<void> {
    this.pup ??= await launch(this.options)
    this.page ??= await this.pup.newPage()
  }

  async fetch(url: string): Promise<Page> {
    if (!this.pup || !this.page) {
      throw new Error('no pup|page set')
    }

    this.content = await this.page.goto(url)

    return this.page
  }

  async destroy(): Promise<void> {
    await this.pup?.close()
  }
}
