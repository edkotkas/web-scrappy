export interface Config {
  type: string
  path: string
  nullable?: boolean
}

export interface AttributeConfig extends Config {
  attr: string
}

export interface ListConfig extends Config {
  value: Config
}

export interface TextConfig extends Config {
  pattern?: Pattern
}

export interface Pattern {
  match: string
  index: number
}

export interface RecordProperty extends Config {
  key: string
}

export interface RecordConfig extends Config {
  props: RecordProperty[]
}
