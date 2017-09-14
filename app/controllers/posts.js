'use strict'

const controller = require('lib/wiring/controller')
const models = require('app/models')
const Post = models.post

const authenticate = require('./concerns/authenticate')
const setUser = require('./concerns/set-current-user')
const setModel = require('./concerns/set-mongoose-model')

const create = (req, res, next) => {
  const post = Object.assign(req.body.post, {
    _owner: req.user._id
  })
  Post.create(post)
    .then(post => {
      res.status(201)
        .json({
          post: post.toJSON({ user: req.user })
        })
    })
    .catch(next)
}

// A signed in user will be able to get ALL posts
// (from other users also)
const index = (req, res, next) => {
  Post.find()
    .then(posts => res.json({
      posts: posts.map((e) =>
        e.toJSON({ virtuals: true, user: req.user }))
    }))
    .catch(next)
}

// Like index, a signed in user will have access to ANY post
// including those created by other users
const show = (req, res) => {
  res.json({
    // request.user just for JSON display?
    post: req.post.toJSON({ user: req.user })
  })
}

// for curl, if a value is not included it will update to blank
const update = (req, res, next) => {
  delete req.body._owner  // disallow owner reassignment.
  req.post.update(req.body.post)
    .then(() => res.sendStatus(204))
    .catch(next)
}

const destroy = (req, res, next) => {
  req.post.remove()
    .then(() => res.sendStatus(204))
    .catch(next)
}

module.exports = controller({
  create,
  index,
  show,
  update,
  destroy
}, { before: [
  // setUser is allowing for authentication??
  { method: setUser, only: ['index', 'show'] },
  { method: authenticate, except: ['index', 'show'] },
  { method: setModel(Post), only: ['show'] },
  { method: setModel(Post, { forUser: true }), only: ['update', 'destroy'] }
] })
