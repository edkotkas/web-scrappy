export interface Config {
  type: string

  main?: boolean
  ref?: string
  root?: string
  nullable?: boolean
  parent?: ConfigTypes
}

export interface ElementConfig extends Config {
  path: string
}

export interface AttributeConfig extends ElementConfig {
  attr: string
}

export interface ListConfig extends ElementConfig {
  value: Config
  sequence?: boolean
  delay?: number
}

export interface TextConfig extends ElementConfig {
  trim?: boolean
  pattern?: Pattern
}

export interface Pattern {
  match: string
  index: number
}

export interface RecordProperty extends ElementConfig {
  key: string
}

export interface RecordConfig extends ElementConfig {
  props: RecordProperty[]
}

export interface FollowConfig extends AttributeConfig {
  conf: Config
}

export interface ReferenceConfig extends Config {
  use: string
}

export type ConfigTypes =
  | TextConfig
  | RecordConfig
  | ReferenceConfig
  | ListConfig
  | AttributeConfig
  | FollowConfig
  | ElementConfig
  | Config
