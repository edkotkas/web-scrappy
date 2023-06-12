import { ElementHandle, Page } from 'puppeteer'
import { ElementConfig, ElementPattern, ElementTypes, MathOperators, SortOrder, TransformTypes } from '../models/element.model.js'

export class ScraperService {

  private processors: Record<ElementTypes, any> = {
    [ElementTypes.list]: (conf: ElementConfig, node: ElementHandle) => this.list(conf, node),
    [ElementTypes.number]: (conf: ElementConfig, node: ElementHandle) => this.number(conf, node),
    [ElementTypes.text]: (conf: ElementConfig, node: ElementHandle) => this.text(conf, node),
    [ElementTypes.object]: (conf: ElementConfig, node: ElementHandle) => this.object(conf, node)
  }

  constructor(
    private config: ElementConfig,
    private page: Page
  ) { }

  async read() {
    const proc = this.processors[this.config.type]
    if (!proc) {
      throw new Error(`not a valid prop type '${this.config.type}'`)
    }

    const node = await this.page.$('html')
    return proc(this.config, node)
  }

  private async list(conf: ElementConfig, node: ElementHandle): Promise<any[]> {
    if (!conf.value) {
      throw new Error(`'no value provided for list in '${conf.path}'`)
    }

    const proc = this.processors[conf.value.type]
    const nodes = await node.$$(conf.path)
    const processedNodes = nodes.map(el => proc(conf.value, el))
    let list = await Promise.all(processedNodes)

    // TODO: create options service
    if (conf.options) {
      if (conf.options.sort) {
        const { by, order } = conf.options?.sort ?? {}
        if (!by) {
          throw new Error(`invalid sort by option provided in '${conf.path}'`)
        }

        list = list.sort((a, b) => this.transform(conf.options?.sort, a) - this.transform(conf.options?.sort, b))

        if (!order) {
          throw new Error(`invalid sort order option provided in '${conf.path}'`)
        }
        if (order === SortOrder.desc) {
          list = list.reverse()
        }
      }
    }

    return list
  }

  private async object(conf: ElementConfig, node: ElementHandle): Promise<any> {
    if (!conf.props) {
      throw new Error(`no props provided for object in '${conf.path}'`)
    }

    const result: any = {}

    for (const prop of conf.props) {
      if (!prop.key) {
        throw new Error(`no key provided for prop in '${conf.path}'`)
      }

      const proc = this.processors[prop.type]
      if (!proc) {
        throw new Error(`not a valid prop type '${prop.type}'`)
      }

      result[prop.key] = await proc(prop, node)
    }

    return result
  }

  private async text(conf: ElementConfig, node: ElementHandle): Promise<string | null> {
    try {
      const text = await node.$eval(conf.path, e => e.textContent)
      if (!text) {
        return ''
      }

      const result = conf.pattern
        ? this.pattern(conf.pattern, text)
        : text

      return result
    } catch (e: any) {
      if (e.message.includes('failed to find element') && conf.nullable) {
        return ''
      }

      throw e
    }

  }

  private async number(conf: ElementConfig, node: ElementHandle): Promise<number | null> {
    const result = await this.text(conf, node)
    return Number(result) ?? null
  }

  private pattern(pattern: ElementPattern, text: string): string | null {
    const match = RegExp(pattern.match).exec(text)
    return match && match[pattern.index]
  }

  private transform(sort: any, element: any) {
    // TODO: create transform service
    const { by, transform } = sort ?? {}

    if (transform && transform.value) {
      let applyTransform = false

      if (transform.condition) {
        const { prop, type, value } = transform.condition
        if (type === 'contains') {
          if (element[prop].includes(value)) {
            applyTransform = true
          }
        }
      }
      else {
        applyTransform = true
      }

      if (applyTransform) {
        if (transform.type === TransformTypes.math) {
          if (transform.operator === MathOperators.multiply) {
            return element[by] * transform.value
          }
        }
      }
    }

    return element[by]
  }
}
