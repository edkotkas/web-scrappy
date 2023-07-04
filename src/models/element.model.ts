export type Value = number | string | null | undefined
export type ListValue = Value[]
export type RecordValue = Record<string, ListValue | Value>
export type Values = Value | ListValue | RecordValue
