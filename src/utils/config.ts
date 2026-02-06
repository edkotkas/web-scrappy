export interface ScraperConfig {
  pageLimit?: number
  headless?: boolean
  adBlocker?: boolean
}

export class ConfigService {
  private readonly config: ScraperConfig

  constructor(config: ScraperConfig = {}) {
    this.config = {
      pageLimit: 5,
      headless: true,
      adBlocker: true,
      ...config
    }
  }

  get<T>(key: string, defaultValue?: T): T {
    const value = this.config[key as keyof ScraperConfig]

    return (value ?? defaultValue) as T
  }
}
