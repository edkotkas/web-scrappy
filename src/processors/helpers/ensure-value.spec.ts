import { describe, expect, it } from 'vitest'
import type { ScraperConfig } from '../../interfaces/scraper-config.interface.js'
import { ensureValue, handleMissing } from './ensure-value.js'

const baseConfig: ScraperConfig = { type: 'text' }

describe('handleMissing', () => {
  it('returns null when allowNull is enabled', () => {
    const result = handleMissing({ ...baseConfig, allowNull: true }, 'missing')

    expect(result).toBeNull()
  })

  it('throws an error when allowNull is disabled', () => {
    expect(() => handleMissing(baseConfig, 'value is required')).toThrow('value is required')
  })
})

describe('ensureValue', () => {
  it('returns a non-empty value as-is', () => {
    const result = ensureValue('hello', baseConfig, 'missing')

    expect(result).toBe('hello')
  })

  it('returns null for missing values when allowNull is enabled', () => {
    const result = ensureValue(undefined, { ...baseConfig, allowNull: true }, 'missing')

    expect(result).toBeNull()
  })

  it('throws for missing values when allowNull is disabled', () => {
    expect(() => ensureValue(null, baseConfig, 'missing value')).toThrow('missing value')
  })

  it('treats empty string as missing and returns null when allowNull is enabled', () => {
    const result = ensureValue('', { ...baseConfig, allowNull: true }, 'missing')

    expect(result).toBeNull()
  })

  it('treats zero as missing and throws when allowNull is disabled', () => {
    expect(() => ensureValue(0, baseConfig, 'missing number')).toThrow('missing number')
  })
})
