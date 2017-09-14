'use strict'

module.exports = require('lib/wiring/routes')

// create routes

// what to run for `GET /`
.root('root#root')

// standards RESTful routes
.resources('examples')

// users of the app have special requirements
.post('/sign-up', 'users#signup')
.post('/sign-in', 'users#signin')
.delete('/sign-out/:id', 'users#signout')
.patch('/change-password/:id', 'users#changepw')
.resources('users', { only: ['index', 'show'] })

// all routes created
.post('/posts', 'posts#create')
.get('/posts/:id', 'posts#show')
.get('/posts', 'posts#index')
// TODO separate routes for updating title or body? or add
// conditional in controller
.patch('/posts/:id', 'posts#update')
.delete('/posts/:id', 'posts#destroy')
