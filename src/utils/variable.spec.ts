import { beforeEach, describe, expect, it } from 'vitest'
import type { AdapterPage } from '../interfaces/browser-adapter.interface.js'
import type { ScraperConfig } from '../interfaces/scraper-config.interface.js'
import { createVariableContainer, type VariableContainer } from './variable.js'

function createPageStub(url: string): AdapterPage {
  return {
    url: () => url,
    content: async () => Promise.resolve('')
  }
}

describe('createVariableContainer', () => {
  let vars: VariableContainer

  beforeEach(() => {
    vars = createVariableContainer()
  })

  it('sets predefined url variables from the current page', () => {
    vars.setupPage(createPageStub('https://example.com:8080/path/name?query=value#section'))

    expect(vars.replace('${url}')).toBe('')
    expect(vars.replace('${hostname}')).toBe('example.com')
    expect(vars.replace('${protocol}')).toBe('https:')
    expect(vars.replace('${pathname}')).toBe('/path/name')
    expect(vars.replace('${search}')).toBe('?query=value')
    expect(vars.replace('${hash}')).toBe('#section')
    expect(vars.replace('${origin}')).toBe('https://example.com:8080')
    expect(vars.replace('${host}')).toBe('example.com:8080')
    expect(vars.replace('${port}')).toBe('8080')
  })

  it('applies config vars on setup and allows overriding predefined keys', () => {
    vars.setupPage(createPageStub('https://example.com/home'), {
      type: 'html',
      vars: {
        hostname: 'override.host',
        token: 'abc123'
      }
    } as ScraperConfig)

    expect(vars.replace('${hostname}')).toBe('override.host')
    expect(vars.replace('${token}')).toBe('abc123')
  })

  it('replaces both ${name} and {name} placeholders and leaves unknown vars intact', () => {
    vars.set('name', 'Ayumi')

    expect(vars.replace('Hello ${name}!')).toBe('Hello Ayumi!')
    expect(vars.replace('Hello {name}!')).toBe('Hello Ayumi!')
    expect(vars.replace('Missing: ${unknown}')).toBe('Missing: ${unknown}')
  })

  it('setFromConfig is a no-op when no vars are provided', () => {
    vars.set('name', 'Ayumi')
    vars.setFromConfig(undefined)

    expect(vars.replace('${name}')).toBe('Ayumi')
  })

  it('clear removes all variables', () => {
    vars.set('name', 'Ayumi')
    vars.clear()

    expect(vars.replace('${name}')).toBe('${name}')
  })

  it('clone returns an independent copy of the current state', () => {
    vars.set('name', 'Ayumi')
    const snapshot = vars.clone()

    vars.set('name', 'Changed')

    expect(snapshot.get('name')).toBe('Ayumi')
    expect(vars.replace('${name}')).toBe('Changed')
  })

  it('restorePage restores only predefined page keys from a snapshot', () => {
    vars.setupPage(createPageStub('https://before.example.com/one'))
    const snapshot = vars.clone()

    vars.setupPage(createPageStub('https://after.example.com/two'))
    vars.set('runtime', 'temp-value')

    vars.restorePage(snapshot)

    expect(vars.replace('${hostname}')).toBe('before.example.com')
    expect(vars.replace('${pathname}')).toBe('/one')
    expect(vars.replace('${runtime}')).toBe('temp-value')
  })

  it('restorePage deletes predefined keys that do not exist in the provided map', () => {
    vars.setupPage(createPageStub('https://example.com/path'))
    vars.restorePage(new Map([['hostname', 'restored.example.com']]))

    expect(vars.replace('${hostname}')).toBe('restored.example.com')
    expect(vars.replace('${url}')).toBe('${url}')
    expect(vars.replace('${pathname}')).toBe('${pathname}')
  })
})
