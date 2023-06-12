export interface ElementConfig {
  type: ElementTypes
  path: string
  options?: ElementOptions
  pattern?: ElementPattern
  value?: ElementConfig
  props?: ElementConfig[]
  key?: string
  nullable?: boolean
}

export interface ElementPattern {
  match: string
  index: number
}

export interface ElementOptions {
  sort?: SortOptions
}

export interface SortOptions {
  by: string
  order: SortOrder
  transform: TransformOptions
}

export enum SortOrder {
  asc = 'asc',
  desc = 'desc'
}

export interface TransformOptions {
  type: TransformTypes
  operator?: MathOperators
  value?: number
  condition: TransformCondition
}

export interface TransformCondition {
  prop: string
  type: string
  value: string
}

//TODO: expand other options
export enum TransformTypes {
  math = 'math'
}

//TODO: add the rest
export enum MathOperators {
  multiply = 'multiply'
}

export enum ElementTypes {
  list = 'list',
  text = 'text',
  number = 'number',
  object = 'object'
}

export type ElementValueType = string | number | null
