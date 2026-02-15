import { createScraperEngine } from './public.js'

try {
  const engine = await createScraperEngine()

  const result = await engine.scrape({
    type: 'text',
    url: 'https://example.com',
    path: '//div',
    pathType: 'xpath'
  })

  console.log('Scraped Result:', result)
} catch (error: unknown) {
  console.error('Error during scraping:', error)
}
