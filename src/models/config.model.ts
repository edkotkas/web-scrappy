import type { ValueType } from './element.model.js'

export interface Config {
  type: string

  main?: boolean
  ref?: string
  root?: string
  null?: boolean
  parent?: ConfigTypes
  vars?: Record<string, ValueType>
}

export interface ElementConfig extends Config {
  path: string
}

export interface AttributeConfig extends ElementConfig {
  attr?: string[]
}

export interface ListConfig extends ElementConfig {
  value: Config
  sequence?: boolean
  delay?: number
  order?: ListOrder
}

export interface ListOrder {
  by?: string
  direction?: 'asc' | 'desc' | 'reverse'
}

export interface TextConfig extends ElementConfig {
  prepend?: string
  append?: string
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
