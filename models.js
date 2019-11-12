'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let authorSchema = mongoose.Schema({
    firstName: 'string',
    lastName: 'string',
    userName: {
      type: 'string',
      unique: true
    }
});

var Author = mongoose.model('Author', authorSchema);

var blogPostSchema = mongoose.Schema({
    title: 'string',
    content: 'string',
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
    comments: [commentSchema]
  });

  const BlogPost = mongoose.model('BlogPost', blogPostSchema);