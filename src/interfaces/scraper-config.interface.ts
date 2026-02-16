import type { NavigationWaitUntil } from './browser-adapter.interface.js'
export interface WaitConfig {
  type: NavigationWaitUntil
  value?: string
  timeout?: number
}

export type ListOrderDirection = 'asc' | 'desc' | 'reverse'

export interface ListOrder {
  by?: string
  direction?: ListOrderDirection
}

export interface Pattern {
  match: string
  index?: number
  replace?: string
  flags?: string
}

export type ConfigType = 'html' | 'text' | 'number' | 'attribute' | 'image' | 'list' | 'object' | 'reference' | 'follow'

export type PathType = 'css' | 'xpath'

export interface ScraperConfig {
  type: ConfigType
  url?: string
  path?: string
  pathType?: PathType
  ref?: string
  root?: string
  allowNull?: boolean
  parent?: ScraperConfig
  vars?: Record<string, string>
  waitFor?: WaitConfig
  timeout?: number
  attribute?: string
  config?: ScraperConfig
  sequence?: boolean
  delay?: number
  order?: ListOrder
  use?: string
  prepend?: string
  append?: string
  trim?: boolean
  pattern?: Pattern
  key?: string
  id?: string
  props?: ScraperConfig[]
}
