import type { VariableContainer } from '../../context/index.js'
import type { ScraperConfig } from '../../interfaces/scraper-config.interface.js'

export function formatText(
  config: ScraperConfig,
  text: string,
  vars: VariableContainer
): string {
  let result = text

  if (config.trim) {
    result = result.trim()
  }

  if (config.pattern) {
    const regex = new RegExp(config.pattern.match, config.pattern.flags ?? '')

    if (config.pattern.replace !== undefined) {
      const replacement = vars.replace(config.pattern.replace)

      result = result.replace(regex, replacement)
    } else if (config.pattern.index !== undefined) {
      const match = result.match(regex)

      if (match?.[config.pattern.index] !== undefined) {
        result = match[config.pattern.index]
      }
    }
  }

  if (config.prepend) {
    const prepend = vars.replace(config.prepend)

    result = prepend + result
  }

  if (config.append) {
    const append = vars.replace(config.append)

    result = result + append
  }

  return result
}
