import { describe, expect, it } from 'vitest'
import type { ScraperConfig } from '../../interfaces/scraper-config.interface.js'
import { createVariableContainer } from '../../utils/variable.js'
import { formatText } from './formatter.js'

const baseConfig: ScraperConfig = { type: 'text' }

describe('formatText', () => {
  it('returns original text when no formatting options are provided', () => {
    const vars = createVariableContainer()

    const result = formatText(baseConfig, 'hello', vars)

    expect(result).toBe('hello')
  })

  it('trims text when trim is enabled', () => {
    const vars = createVariableContainer()

    const result = formatText({ ...baseConfig, trim: true }, '  hello  ', vars)

    expect(result).toBe('hello')
  })

  it('replaces pattern with variable-aware replacement string', () => {
    const vars = createVariableContainer()

    vars.set('name', 'Ayumi')

    const result = formatText(
      {
        ...baseConfig,
        pattern: {
          match: 'world',
          replace: 'hi ${name}'
        }
      },
      'hello world',
      vars
    )

    expect(result).toBe('hello hi Ayumi')
  })

  it('extracts a capture group by pattern index', () => {
    const vars = createVariableContainer()

    const result = formatText(
      {
        ...baseConfig,
        pattern: {
          match: 'ID:(\\d+)',
          index: 1
        }
      },
      'prefix ID:42 suffix',
      vars
    )

    expect(result).toBe('42')
  })

  it('keeps original text when pattern index does not match', () => {
    const vars = createVariableContainer()

    const result = formatText(
      {
        ...baseConfig,
        pattern: {
          match: 'ID:(\\d+)',
          index: 2
        }
      },
      'prefix ID:42 suffix',
      vars
    )

    expect(result).toBe('prefix ID:42 suffix')
  })

  it('applies prepend and append with variable replacement', () => {
    const vars = createVariableContainer()

    vars.set('left', '[')
    vars.set('right', ']')

    const result = formatText(
      {
        ...baseConfig,
        prepend: '${left}',
        append: '${right}'
      },
      'value',
      vars
    )

    expect(result).toBe('[value]')
  })

  it('applies operations in order: trim, pattern, prepend, append', () => {
    const vars = createVariableContainer()

    vars.set('prefix', '<')
    vars.set('suffix', '>')

    const result = formatText(
      {
        ...baseConfig,
        trim: true,
        pattern: {
          match: 'foo',
          replace: 'bar'
        },
        prepend: '${prefix}',
        append: '${suffix}'
      },
      '  foo  ',
      vars
    )

    expect(result).toBe('<bar>')
  })
})
