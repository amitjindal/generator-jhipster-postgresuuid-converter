# generator-jhipster-postgresuuid-converter
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> JHipster module for converting Postgresql keys from Long to UUID

# Introduction

This is a [JHipster](http://jhipster.github.io/) module, that is meant to be used in a JHipster application.

# Prerequisites

As this is a [JHipster](http://jhipster.github.io/) module, we expect you have JHipster and its related tools already installed:

- [Installing JHipster](https://jhipster.github.io/installation.html)

# Installation

To install this module:

```bash
npm install -g generator-jhipster-postgresuuid-converter
```

To update this module:
```bash
npm update -g generator-jhipster-postgresuuid-converter
```

# Usage

No other steps really needed. The generator should hook automatically into your entity generator and convert the code to UUID.
However there are important considerations to be noted.

WARNING: This is a work in progress. Please do not use it in production or use at your own risk.

## Important Considerations

- We assume that Long needs to be converted to UUID so it will convert all Long type parameters to UUID. Please be careful.
- Some tests may not generate completely. That needs to be fixed.
- Elastic Search won't work. Need a fix for that.
- USE AT YOUR OWN RISK. I cannot really cover all cases so if something breaks, sorry.

# License

MIT © [Amit Jindal](https://amitjindal.me)


[npm-image]: https://img.shields.io/npm/v/generator-jhipster-postgresuuid-converter.svg
[npm-url]: https://npmjs.org/package/generator-jhipster-postgresuuid-converter
[travis-image]: https://travis-ci.org/amitjindal/generator-jhipster-postgresuuid-converter.svg?branch=master
[travis-url]: https://travis-ci.org/amitjindal/generator-jhipster-postgresuuid-converter
[daviddm-image]: https://david-dm.org/amitjindal/generator-jhipster-postgresuuid-converter.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/amitjindal/generator-jhipster-module
