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

const indexUserPosts = (req, res, next) => {
  // Need to check if req.user.id === params.user_id?
  Post.find({ _owner: req.params.user_id })
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
    post: req.post.toJSON({ virtuals: true, user: req.user })
  })
}

// UPDATING your files returns 204
// UPDATING another users returns 404
const update = (req, res, next) => {
  // req.body.post === data being sent to update
  const updatedPostData = req.body.post
  // for each key in req.post === ''
  for (const prop in updatedPostData) {
    if (updatedPostData[prop] === '') {
      // delete that key before sending it to update function
      delete updatedPostData[prop]
    }
  }
  delete req.body._owner  // disallow owner reassignment.
  // req.post === the post in the database to be updated
  req.post.update(updatedPostData) // send in filtered UPDATE data
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
  indexUserPosts,
  show,
  update,
  destroy
}, { before: [
  { method: setUser, only: ['index', 'show'] },
  { method: authenticate, except: ['index', 'show'] },
  { method: setModel(Post), only: ['show'] },
  { method: setModel(Post, { forUser: true }), only: ['update', 'destroy'] }
] })
