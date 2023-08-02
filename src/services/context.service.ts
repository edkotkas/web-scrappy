import type { ConfigTypes, ContextEvents, Values } from '@models'
import { EventEmitter } from 'node:events'

export class ContextService {
  private confs: Record<string, ConfigTypes> = {}
  main!: ConfigTypes

  private _events = new EventEmitter()
  get events(): ContextEvents {
    return {
      on: (
        key: string,
        listener: (conf: ConfigTypes, result: Values) => void
      ) => this._events.on(key, listener),
      off: (
        key: string,
        listener: (conf: ConfigTypes, result: Values) => void
      ) => this._events.off(key, listener),
      emit: (key: string, conf: ConfigTypes, result: Values) =>
        this._events.emit(key, conf, result)
    }
  }

  constructor(conf: ConfigTypes | ConfigTypes[]) {
    this.process(conf)
  }

  process(conf: ConfigTypes | ConfigTypes[]) {
    if (Array.isArray(conf)) {
      const main = conf.find((c) => c.main)
      if (!main) {
        throw new Error(
          `'main' property must be set when multiple confs passed`
        )
      }

      this.main = main

      conf.forEach((c) => this.processConf(c))

      return
    }

    this.main = conf
    this.processConf(conf)
  }

  getRef(ref: string): ConfigTypes {
    return this.confs[ref]
  }

  private processConf(conf: ConfigTypes): void {
    this.dig(conf, (c) => {
      if (c.ref) {
        this.confs[c.ref] = conf
      }
    })
  }

  dig(
    conf: ConfigTypes,
    action: (conf: ConfigTypes) => void,
    parent?: ConfigTypes
  ) {
    if (parent) {
      conf.parent = parent
    }

    action(conf)

    if ('value' in conf) {
      this.dig(conf.value, action, conf)
    }

    if ('conf' in conf) {
      this.dig(conf.conf, action, conf)
    }

    if ('props' in conf) {
      conf.props.forEach((p) => {
        this.dig(p, action, conf)
      })
    }
  }
}
