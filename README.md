# PaPM Spreadsheet Service (WIP)

### Prerequisites

-   Node v12.x.x
-   Yarn

[Linux / Mac installation](https://github.com/nvm-sh/nvm#install--update-script)

[Windows installation](https://docs.microsoft.com/en-us/windows/nodejs/setup-on-windows#alternative-version-managers)

To easily switch between different versions run command below which automatically detects a required version

```bash
$ nvm use
```

## Description

PaPM Spreadsheet service

## Installation

```bash
$ yarn
```

## Configuration

Before running the app:

1. Go to `config` in the project directory

```bash
$ cp dev.env.example dev.env
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod

# debug mode
$ yarn start:debug

```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```
