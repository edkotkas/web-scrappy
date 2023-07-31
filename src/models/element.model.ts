import type { HTTPResponse } from 'puppeteer'

export type Value = HTTPResponse | Buffer | number | string | undefined
export type ListValue = Values[]
export type RecordValue = Record<string, Value>

export interface ImageValue {
  url: string
  buffer: Buffer
}

export type Values = ListValue | RecordValue | ImageValue | Value
