export type ValueType = number | string | boolean | undefined

export enum VarsEnum {
  PREFIX = 'vars/',
  ORIGIN = 'ORIGIN',
  HOST = 'HOST',
  HOSTNAME = 'HOSTNAME',
  PATHNAME = 'PATHNAME',
  PORT = 'PORT',
  PROTOCOL = 'PROTOCOL',
  SEARCH = 'SEARCH'
}

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface RecordValue {
  [key: string]: Values
}

export interface ImageValue {
  url: string
  buffer: Buffer
}

export type Values = ListValue | RecordValue | ImageValue | ValueType
export type ListValue = Values[]
