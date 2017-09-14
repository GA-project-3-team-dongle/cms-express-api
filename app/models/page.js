'use strict'

const mongoose = require('mongoose')

const pageSchema = new mongoose.Schema({
  pageTitle: {
    type: String,
    required: true
  },
  sections: {
    sectionTitle: {
      type: String,
      required: true
    },
    body: {
      type: String
    }
  },
  _owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret, options) {
      const userId = (options.user && options.user._id) || false
      ret.editable = userId && userId.equals(doc._owner)
      return ret
    }
  }
})

const Page = mongoose.model('Page', pageSchema)

module.exports = Page
