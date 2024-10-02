import type { Pattern, TextConfig, ValueType } from '@models'
import { ContextService } from '@services'

export abstract class TextUtils {
  constructor() {}

  static process(
    conf: TextConfig,
    context: ContextService,
    text: string
  ): string | undefined {
    let result = text

    if (conf.pattern) {
      result = TextUtils.pattern(conf.pattern, text) ?? result
    }

    if (!result) {
      return result
    }

    if (conf.trim) {
      result = result
        .trim()
        .split(' ')
        .filter((x) => x.trim())
        .join(' ')
    }

    if (conf.prepend) {
      const value = TextUtils.getVar(conf.prepend, context)
      result = value + result
    }

    if (conf.append) {
      const value = TextUtils.getVar(conf.append, context)
      result = result + value
    }

    return result
  }

  static pattern(pattern: Pattern, text: string): string | undefined {
    const match = RegExp(pattern.match).exec(text)
    return match?.[pattern.index]
  }

  static getVar(name: string, context: ContextService): ValueType {
    const value = context.getVar(name)
    if (!value) {
      return
    }

    return value
  }
}
