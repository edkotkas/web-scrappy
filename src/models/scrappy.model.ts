import type { Configuration, HTTPResponse, Page } from 'puppeteer'

export interface ScrappyOptions {
  pup?: Configuration
  log?: boolean
  adblock?: boolean
}

export interface PageData {
  page: Page
  res: HTTPResponse[]
}
