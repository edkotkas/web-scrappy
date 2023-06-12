import {launch, Browser, HTTPResponse, Page} from 'puppeteer'

export class PuppetService {
  public pup!: Browser
  public page!: Page

  async init(): Promise<void> {
    this.pup = await launch({
      headless: 'new'
    })

    this.page = await this.pup.newPage()
  }

  fetch(url: string): Promise<HTTPResponse | null> {
    return this.page.goto(url)
  }

  async destroy() {
    await this.pup.close()
  }
}
