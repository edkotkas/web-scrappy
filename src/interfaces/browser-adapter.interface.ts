import type { NavigationOptions } from './navigation-options.interface.js'
import type { ScraperConfig } from './scraper-config.interface.js'

export type NavigationWaitUntil =
  | 'load'
  | 'domcontentloaded'
  | 'networkidle0'
  | 'networkidle2'

export interface AdapterPage {
  url(): string
  content(): Promise<string>
}

export interface AdapterElement {
  evaluate<T>(pageFunction: (element: Element) => T): Promise<T>
  evaluate<T, Arg>(
    pageFunction: (element: Element, arg: Arg) => T,
    arg: Arg
  ): Promise<T>
}

export interface ResponseData {
  url: string
  buffer: () => Promise<Buffer>
  contentType: string
  statusCode: number
  headers: Record<string, string>
}

export interface BrowserAdapter<
  TPage = AdapterPage,
  TElement = AdapterElement
> {
  initialize?(): void | Promise<void>
  root(page: TPage, path?: string): Promise<TElement | null>
  createPage(): Promise<TPage>
  navigateToPage(page: TPage, options: NavigationOptions): Promise<void>
  getResponse?(url: string, contentType?: string): ResponseData | undefined
  closePage(page: TPage): Promise<void>
  destroy(): Promise<void>

  extractNodes(element: TElement, selector: string): Promise<TElement[]>
  extractNode(element: TElement, selector: string): Promise<TElement | null>
  extractHtml(element: TElement, config: ScraperConfig): Promise<string | null>
  extractText(element: TElement, config: ScraperConfig): Promise<string | null>
  extractAttribute(
    element: TElement,
    config: ScraperConfig
  ): Promise<string | null>
}
