import { handleMissing } from './helpers/index.js'
import type { Processor } from './processor.registry.js'

// TODO: chek if we need ensureValue here
export const createImageProcessor = (): Processor => ({
  async process({ element, browser, config }): Promise<Buffer | null> {
    const getImageBuffer = async (url: string): Promise<Buffer | undefined> =>
      browser.getResponse?.(url, 'image/')?.buffer()

    if (config.attribute) {
      const attribute = await browser.extractAttribute(element, config)

      if (attribute) {
        return (await getImageBuffer(attribute)) ?? null
      }
    }

    config.attribute = 'src'
    const src = await browser.extractAttribute(element, config)

    if (src) {
      return (await getImageBuffer(src)) ?? null
    }

    config.attribute = 'data-src'
    const dataSrc = await browser.extractAttribute(element, config)

    if (dataSrc) {
      return (await getImageBuffer(dataSrc)) ?? null
    }

    return handleMissing(
      config,
      `no image source found for element at path: ${config.path ?? 'element'}`
    )
  }
})
