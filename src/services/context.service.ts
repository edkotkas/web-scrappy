import type { ConfigTypes } from '@models'

export class ContextService {
  private context: {
    confs: Record<string, ConfigTypes>
  }

  main: ConfigTypes

  constructor(conf: ConfigTypes | ConfigTypes[]) {
    this.context = { confs: {} }

    if (Array.isArray(conf)) {
      const main = conf.find((c) => c.main)
      if (!main) {
        throw new Error(
          `'main' property must be set when multiple confs passed`
        )
      }

      this.main = main

      conf.forEach((c) => {
        this.process(c)
      })

      return
    }

    this.main = conf
    this.process(conf)
  }

  private process(conf: ConfigTypes): void {
    if (conf.ref) {
      this.context.confs[conf.ref] = conf
    }

    if ('value' in conf) {
      this.process(conf.value)
    }

    if ('conf' in conf) {
      this.process(conf.conf)
    }

    if ('props' in conf) {
      conf.props.forEach((p) => {
        this.process(p)
      })
    }
  }

  getRef(ref: string): ConfigTypes {
    return this.context.confs[ref]
  }
}
