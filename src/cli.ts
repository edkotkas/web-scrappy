#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

import { Scrappy } from './main.js'
import type { Config } from './models/config.model.js'
import type { PuppyService } from './services/puppy.service.js'

let pup!: PuppyService

async function start(): Promise<void> {
  const [url, conf, out] = process.argv.slice(2)
  const cwd = process.cwd()

  const { puppy, processor } = new Scrappy()
  pup = puppy

  await puppy.setup()
  const page = await puppy.fetch(url)

  const configFile = await fs.readFile(path.join(cwd, conf), 'utf-8')
  const config = JSON.parse(configFile) as Config
  const result = await processor.read(config, page)

  if (!out) {
    console.log(result)

    return
  }

  await fs.writeFile(path.join(cwd, out), JSON.stringify(result, null, 2))

  await pup.destroy()
}

try {
  await start()
} catch (e) {
  console.error(e)
} finally {
  await pup.destroy()
}
