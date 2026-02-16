import { afterEach, describe, expect, it, vi } from 'vitest'
import { createLogger } from './logger.js'

describe('createLogger', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logs with context and forwards extra arguments', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined)
    const logger = createLogger('scraper')

    logger.log('started', { id: 1 }, 'ok')

    expect(logSpy).toHaveBeenCalledExactlyOnceWith('[scraper] started', { id: 1 }, 'ok')
  })

  it('errors with context and forwards extra arguments', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const logger = createLogger('scraper')

    logger.error('failed', new Error('boom'))

    expect(errorSpy).toHaveBeenCalledExactlyOnceWith('[scraper] failed', expect.any(Error))
  })

  it('warns without context using the current formatting', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const logger = createLogger()

    logger.warn('careful')

    expect(warnSpy).toHaveBeenCalledExactlyOnceWith('careful')
  })

  it('debugs without context and forwards arguments', () => {
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined)
    const logger = createLogger()

    logger.debug('trace', 123, { enabled: true })

    expect(debugSpy).toHaveBeenCalledExactlyOnceWith('trace', 123, { enabled: true })
  })
})
