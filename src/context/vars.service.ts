import type { AdapterPage } from '../interfaces/browser-adapter.interface.js'
import type { ScraperConfig } from '../interfaces/scraper-config.interface.js'

export interface VariableContainer {
  setupPage(page: AdapterPage, config?: ScraperConfig): void
  restorePage(vars: Map<string, string>): void
  setFromConfig(configVars?: Record<string, string>): void
  set(key: string, value: string): void
  replace(text: string): string
  clear(): void
  clone(): Map<string, string>
}

export function createVariableContainer(): VariableContainer {
  const container = new Map<string, string>()
  const varsRegex = /\$*\{([^}]+)\}/g
  const predefinedVarKeys = new Set([
    'url',
    'hostname',
    'protocol',
    'pathname',
    'search',
    'hash',
    'origin',
    'host',
    'port'
  ])

  function setForPage(page: AdapterPage, config?: ScraperConfig): void {
    clear()

    const url = new URL(page.url())

    for (const key of predefinedVarKeys) {
      const value = url[key as keyof URL] as string | undefined

      container.set(key, value ?? '')
    }

    if (config) {
      setFromConfig(config.vars)
    }
  }

  function setFromConfig(configVars?: Record<string, string>): void {
    if (!configVars) {
      return
    }

    for (const [key, value] of Object.entries(configVars)) {
      set(key, value)
    }
  }

  function set(key: string, value: string): void {
    container.set(key, value)
  }

  function replace(text: string): string {
    return text.replace(
      varsRegex,
      (_, dollarVar: string | undefined, braceVar: string | undefined) => {
        const varName = dollarVar ?? braceVar ?? ''
        const value = container.get(varName)

        if (value === undefined) {
          return `\${${varName}}`
        }

        return value
      }
    )
  }

  function clear(): void {
    container.clear()
  }

  function clone(): Map<string, string> {
    return new Map(container)
  }

  function restoreForPage(vars: Map<string, string>): void {
    for (const key of predefinedVarKeys) {
      const value = vars.get(key)

      if (value !== undefined) {
        container.set(key, value)
      } else {
        container.delete(key)
      }
    }
  }

  return {
    setupPage: setForPage,
    restorePage: restoreForPage,
    setFromConfig,
    set,
    replace,
    clear,
    clone
  }
}
