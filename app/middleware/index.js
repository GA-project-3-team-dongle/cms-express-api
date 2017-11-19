'use strict'

const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')

const loader = require('lib/wiring/loader')

const corsPort = +('GA'.split('').reduce((p, c) => p + c.charCodeAt(), ''))

const corsOptions = {
  // **** SET THIS BACK TO `http://localhost:{corsPort}` *****
  // hardcoded because of react app cors trouble
  origin: process.env.CLIENT_ORIGIN || `http://localhost:3000`
}

const before = (app) => {
  app.use(cors(corsOptions))
  app.use(favicon(path.join(app.get('root'), 'public', 'favicon.ico')))
  app.use(logger('dev'))
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
}

const after = (app) => {
  app.use(express.static(path.join(app.get('root'), 'public')))
}

const middleware = loader(__filename)
middleware.before = before
middleware.after = after

module.exports = middleware
