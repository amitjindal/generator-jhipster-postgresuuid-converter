# generator-jhipster-postgresuuid-converter
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> JHipster module for converting Postgresql keys from Long to UUID

# Introduction

This is a [JHipster](http://jhipster.github.io/) module, that is meant
to be used in a JHipster application. The purpose of this module is to
convert a **monolithic JHipster application** using `Long` primary keys
to `UUID` based primary keys.

It is important to note that since we don't know what relations may exist,
the module converts all Long members of Entity classes. You might need to
do some manual adjustments to converted code. 

# Prerequisites

As this is a [JHipster](http://jhipster.github.io/) module, we expect you have JHipster and its related tools already installed:

- [Installing JHipster](https://jhipster.github.io/installation.html)

# Installation

## With Yarn

To install this module:

```bash
yarn global add generator-jhipster-postgresuuid-converter
```

To update this module:

```bash
yarn global upgrade generator-jhipster-postgresuuid-converter
```

## With NPM

To install this module:

```bash
npm install -g generator-jhipster-postgresuuid-converter
```

To update this module:

```bash
npm update -g generator-jhipster-postgresuuid-converter
```

# Usage

Once a monolithic JHipster application using Postgresql is generated,
install the module as listed above. On installation, the module will
convert the generated code to use UUIDs (entities are not affected).

For entities you will need to regenerate the entities. After regeneration
Jhipster will call this module as a **post entity creation hook** and module
will convert that entity to UUID based. Any new entity that is generated
after the installation of this module will automatically be UUID based.


# Known Issues

- In some cases tests may not compile as some number conversion may be
incorrect.
- ElasticSearch probably won't work as it does not accepts a UUID primary
key. As per my understanding a converter is needed. I don't know how to
write that so any suggestions are welcome.


# License

MIT © [Amit Jindal](https://www.aquevix.com)


[npm-image]: https://img.shields.io/npm/v/generator-jhipster-postgresuuid-converter.svg
[npm-url]: https://npmjs.org/package/generator-jhipster-postgresuuid-converter
[travis-image]: https://travis-ci.org/amitjindal/generator-jhipster-postgresuuid-converter.svg?branch=master
[travis-url]: https://travis-ci.org/amitjindal/generator-jhipster-postgresuuid-converter
[daviddm-image]: https://david-dm.org/amitjindal/generator-jhipster-postgresuuid-converter.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/amitjindal/generator-jhipster-postgresuuid-converter
