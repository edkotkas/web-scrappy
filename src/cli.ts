#!/usr/bin/env node

import { JsonStreamStringify } from 'json-stream-stringify'
import path from 'node:path'
import fs from 'node:fs'
import type { Config } from '@models'
import { Scrappy } from './main'
import env from './env'
import log from './logger'

function handlePrimitiveCli(args: string[]): string[] {
  if (args.includes('--verbose')) {
    args = args.filter((a) => a !== '--verbose')
    env.log = true
  }

  if (args.includes('--adblock=false')) {
    args = args.filter((a) => a !== '--adblock=false')
    env.adblock = false
  }

  return args
}

void (async function (): Promise<void> {
  const args: string[] = handlePrimitiveCli(process.argv.slice(2))

  const [url, conf, out] = args
  log('args', args)
  log('env', JSON.stringify(env))

  const cwd = process.cwd()
  log('cwd', cwd)
  const confFiles = conf
    .split(';')
    .filter((x) => x.trim())
    .map((c) => fs.promises.readFile(path.join(cwd, c), 'utf-8'))

  const confProms = await Promise.all(confFiles)
  const parsedConfs = confProms.map((c: string) => JSON.parse(c) as Config)
  const multiConf = parsedConfs.length > 1
  const scrappy = new Scrappy(env)

  const events = await scrappy.init(multiConf ? parsedConfs : parsedConfs[0])
  events.on('step', (conf, result) => {
    log(conf.type, result)
  })

  const result = await scrappy.fetch(url)

  if (!out) {
    await scrappy.destroy()
    return console.log(result)
  }

  const ws = fs.createWriteStream(out)
  const jss = new JsonStreamStringify(result)
  jss.once('error', (err: any) => {
    throw new Error(`Failed to write output: ${err.message}`)
  })

  log('Writing to', out)

  jss.pipe(ws)
  jss.on('end', () => {
    ws.end()
  })

  await scrappy.destroy()
})()
