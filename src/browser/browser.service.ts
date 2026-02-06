// export class BrowserService implements BrowserAdapter {
//   private readonly adapter: BrowserAdapter

//   constructor(adapter?: BrowserAdapter) {
//     this.adapter = adapter ?? new PlaywrightAdapter()
//   }

//   initialize(): void | Promise<void> {
//     if (this.adapter.initialize) {
//       return this.adapter.initialize()
//     }
//   }

//   createPage(): Promise<BrowserElement> {
//     return this.adapter.createPage()
//   }

//   navigateToPage(page: BrowserElement, options: NavigationOptions): Promise<void> {
//     return this.adapter.navigateToPage(page, options)
//   }

//   getResponse(url: string, contentType?: string): ResponseData | undefined {
//     return this.adapter.getResponse?.(url, contentType)
//   }

//   closePage(page: BrowserElement): Promise<void> {
//     return this.adapter.closePage(page)
//   }

//   destroy(): Promise<void> {
//     return this.adapter.destroy()
//   }

//   extractNodes(page: BrowserElement, selector: string) {
//     return this.adapter.extractNodes(page, selector)
//   }

//   extractNode(page: BrowserElement, selector: string) {
//     return this.adapter.extractNode(page, selector)
//   }

//   extractText(page: BrowserElement, selector: string) {
//     return this.adapter.extractText(page, selector)
//   }

//   extractAttribute(page: BrowserElement, selector: string, attribute: string) {
//     return this.adapter.extractAttribute(page, selector, attribute)
//   }
// }
