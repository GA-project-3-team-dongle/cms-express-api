'use strict'

const controller = require('lib/wiring/controller')
const models = require('app/models')
const Page = models.page

const authenticate = require('./concerns/authenticate')
const setUser = require('./concerns/set-current-user')
const setModel = require('./concerns/set-mongoose-model')

// All pages from all users
const index = (req, res, next) => {
  Page.find()
    .then(pages => res.json({
      pages: pages.map((e) =>
        e.toJSON({ virtuals: true, user: req.user }))
    }))
    .catch(next)
}

// One page from any user
const show = (req, res) => {
  res.json({
    page: req.pages.toJSON({ virtuals: true, user: req.user })
  })
}

// Create 1 page with sections
const create = (req, res, next) => {
  const page = Object.assign(req.body.page, {
    _owner: req.user._id
  })
  Page.create(page)
    .then(page =>
      res.status(201)
        .json({
          page: page.toJSON({ virtuals: true, user: req.user })
        }))
    .catch(next)
}

// 1 page from any user. Any value not submitted will be updated to blank
const update = (req, res, next) => {
  delete req.body._owner  // disallow owner reassignment.
  req.page.update(req.body.page)
    .then(() => res.sendStatus(204))
    .catch(next)
}

// 1 page from any user
const destroy = (req, res, next) => {
  req.page.remove()
    .then(() => res.sendStatus(204))
    .catch(next)
}

module.exports = controller({
  index,
  show,
  create,
  update,
  destroy
}, { before: [
  { method: setUser, only: ['index', 'show'] },
  { method: authenticate, except: ['index', 'show'] },
  { method: setModel(Page), only: ['show'] },
  { method: setModel(Page, { forUser: true }), only: ['update', 'destroy'] }
] })
