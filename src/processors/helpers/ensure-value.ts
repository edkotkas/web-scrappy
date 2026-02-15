import type { ScraperConfig } from '../../interfaces/scraper-config.interface.js'

export const handleMissing = (config: ScraperConfig, message: string): null => {
  if (config.allowNull) {
    return null
  }

  throw new Error(message)
}

export const ensureValue = <T>(
  value: T | null | undefined,
  config: ScraperConfig,
  message: string
): T | null => {
  if (!value) {
    return handleMissing(config, message)
  }

  return value
}
