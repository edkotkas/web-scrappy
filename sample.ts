import { exit } from 'node:process'
import { createScraper } from './public.js'

const scraper = createScraper()

scraper
  .then(async ({ engine }) => {
    const result = await engine.scrape({
      type: 'text',
      url: 'https://www.novelupdates.com/series/how-to-survive-as-a-villain',
      path: "//div[@class='seriestitlenu']",
      pathType: 'xpath'
    })

    console.log('Scraped Result:', result)
  })
  .catch((error: unknown) => {
    console.error('Scraping Error:', error)
  })
  .finally(() => {
    exit(0)
  })
