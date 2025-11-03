import {
  VarsEnum,
  type ConfigTypes,
  type ContextEvents,
  type ValueType,
  type Values
} from '@models'
import { EventEmitter } from 'node:events'

export class ContextService {
  private readonly confs: Record<string, ConfigTypes> = {}
  private readonly vars: Record<string, ValueType> = {}
  main!: ConfigTypes

  private readonly _events = new EventEmitter()
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

  constructor() {}

  init(conf: ConfigTypes | ConfigTypes[]) {
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

  setVar(key: string, value: ValueType): void {
    this.vars[key] = value
  }

  getVar(key: string | undefined): ValueType {
    if (!key?.startsWith(VarsEnum.PREFIX)) {
      return key
    }
    key = key.replace(VarsEnum.PREFIX, '')
    return this.vars[key]
  }

  private processConf(conf: ConfigTypes): void {
    this.dig(conf, (c) => {
      if (c.ref) {
        this.confs[c.ref] = conf
      }

      if (c.vars) {
        Object.entries(c.vars).forEach(([key, value]) =>
          this.setVar(key, value)
        )
      }
    })
  }

  private dig(
    conf: ConfigTypes,
    action: (conf: ConfigTypes) => void,
    parent?: ConfigTypes
  ): void {
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
