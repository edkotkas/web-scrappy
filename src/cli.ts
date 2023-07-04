#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

import type { PuppyService } from '@services'
import type { Config } from '@models'
import { Scrappy } from './main.js'

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
    return console.log(result)
  }

  await fs.writeFile(
    path.join(cwd, out),
    JSON.stringify(result, null, 2)
  )

  await pup.destroy()
}

try{
  await start()
} catch(e) {
  console.error(e)
} finally {
  await pup.destroy()
}
