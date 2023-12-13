export type Value = number | string | undefined
// export type RecordValue = Record<string, Value>

export interface RecordValue {
  [key: string]: Values
}

export interface ImageValue {
  url: string
  buffer: Buffer
}

export type Values = ListValue | RecordValue | ImageValue | Value
export type ListValue = Values[]
