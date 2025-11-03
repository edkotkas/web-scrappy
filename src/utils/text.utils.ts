import type { Pattern, TextConfig, ValueType } from '@models'
import type { ContextService } from '@services'
import log from '../logger.js'

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class TextUtils {
  constructor() {}

  static process(
    conf: TextConfig,
    context: ContextService,
    text: string
  ): string | undefined {
    let result: string | undefined = text

    if (conf.pattern) {
      result = TextUtils.pattern(conf.pattern, text)
      log('pattern', result)
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
      log('trim', result)
    }

    if (conf.prepend) {
      const value = TextUtils.getVar(conf.prepend, context)
      result = `${value?.toString() ?? ''}${result}`
      log('prepend', result)
    }

    if (conf.append) {
      const value = TextUtils.getVar(conf.append, context)
      result = `${result}${value?.toString() ?? ''}`
      log('append', result)
    }

    return result
  }

  static pattern(pattern: Pattern, text: string): string | undefined {
    const match = RegExp(pattern.match).exec(text)
    log('match', match)
    return match?.[pattern.index]
  }

  static getVar(name: string, context: ContextService): ValueType {
    const value = context.getVar(name)
    if (!value) {
      return
    }

    log('getVar', value)

    return value
  }
}
