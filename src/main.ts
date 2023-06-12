#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

import { PuppetService } from './services/puppet.service.js'
import { ScraperService } from './services/scraper.service.js'

let puppet!: PuppetService

async function start(): Promise<void> {
  const [url, conf, out] = process.argv.slice(2)
  const cwd = process.cwd()

  puppet = new PuppetService()
  await puppet.init()
  await puppet.fetch(url)
  
  const configFile = await fs.readFile(path.join(cwd, conf), 'utf-8')
  const config = JSON.parse(configFile)
  const scraper = new ScraperService(config, puppet.page)
  const result = await scraper.read()

  if (!out) {
    return console.log(result)
  }

  await fs.writeFile(
    path.join(cwd, out),
    JSON.stringify(result, null, 2)
  )

  await puppet.destroy()
}

try{
  await start()
} catch(e) {
  console.error(e)
} finally {
  if(puppet) {
    puppet.destroy()
  }
}
