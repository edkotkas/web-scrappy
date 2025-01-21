import type { Browser, HTTPResponse, Page } from 'puppeteer'
import { launch, LaunchOptions } from 'puppeteer'

export class PuppyService {
  private _options: LaunchOptions = {
    headless: true
  }

  private pup?: Browser
  private page?: Page
  private content?: HTTPResponse | null

  constructor(private options?: LaunchOptions) {
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
