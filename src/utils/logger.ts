export const createLogger = (context?: string) => {
  const prefix = context ? `[${context}] ` : ''

  function log(message: string, ...args: unknown[]): void {
    console.log(`${prefix}${message}`, ...args)
  }

  function error(message: string, ...args: unknown[]): void {
    console.error(`${prefix}${message}`, ...args)
  }

  function warn(message: string, ...args: unknown[]): void {
    console.warn(`${prefix}${message}`, ...args)
  }

  function debug(message: string, ...args: unknown[]): void {
    console.debug(`${prefix}${message}`, ...args)
  }

  return {
    log,
    error,
    warn,
    debug
  }
}
