# web-scrappy 
[![install size](https://packagephobia.com/badge?p=web-scrappy)](https://packagephobia.com/result?p=web-scrappy)
[![c8 config on GitHub](https://img.shields.io/nycrc/edkotkas/web-scrappy?config=.c8rc.json)](coverage\index.html)
[![Snyk Vulnerabilities for npm package](https://img.shields.io/snyk/vulnerabilities/npm/web-scrappy)](https://img.shields.io/snyk/vulnerabilities/npm/web-scrappy)

[![Node.js CI](https://github.com/edkotkas/web-scrappy/actions/workflows/ci.yml/badge.svg)](https://github.com/edkotkas/web-scrappy/actions/workflows/ci.yml)
[![Node.js Package](https://github.com/edkotkas/web-scrappy/actions/workflows/publish.yml/badge.svg)](https://github.com/edkotkas/web-scrappy/actions/workflows/publish.yml)

[![npm](https://img.shields.io/npm/v/web-scrappy)](https://www.npmjs.com/package/web-scrappy)

## web-scrappy

Yet another web scraper, get a site, make a config and get data!


## Install

```bash
npm install -g web-scrappy
```

## Usage

```bash
scrappy <url> <configFile> [outFile]
```
> Example url -> https://wltest.dns-systems.net/
> Example config [here](tests\data\config.json)

## Developing
Get up and running with web-scrappy on your local machine.

### Prerequisites

- Node: Version 19 or higher

### Installing
-  Clone the repository (or fork it)
```bash
git clone https://github.com/edkotkas/web-scrappy.git && cd web-scrappy
```

- Install the dev dependencies
```bash
npm i
```

- Run the script
```bash
npm start -- <url> <configFile> [outFile]
```

- Add issues to Github, make changes to the project and create pull requests for review

### Tests
Run the tests
```bash
npm test
```

## License

ISC © [Eduard Kotkas](https://edkotkas.me)
