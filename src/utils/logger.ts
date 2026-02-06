export const createLogger = (context?: string) => {
  function log(message: string, ...args: unknown[]): void {
    const prefix = context ? `[${context}]` : ''

    console.log(`${prefix} ${message}`, ...args)
  }

  function error(message: string, ...args: unknown[]): void {
    const prefix = context ? `[${context}]` : ''

    console.error(`${prefix} ${message}`, ...args)
  }

  function warn(message: string, ...args: unknown[]): void {
    const prefix = context ? `[${context}]` : ''

    console.warn(`${prefix} ${message}`, ...args)
  }

  function debug(message: string, ...args: unknown[]): void {
    const prefix = context ? `[${context}]` : ''

    console.debug(`${prefix} ${message}`, ...args)
  }

  return {
    log,
    error,
    warn,
    debug
  }
}
