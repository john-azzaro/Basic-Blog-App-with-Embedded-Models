'use strict';

//Imports:
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
mongoose.Promise = global.Promise;


//Module Imports:
const {DATABASE_URL, PORT} = require('./config.js');


//Instantiation:
const app = express();


//Middleware:
app.use(express.json());
app.use(morgan('common'));


//Routes:

// GET route for authors
app.get('/authors', function(req, res) {
   Author
     .find()
     .then(authors => {
       res.json(authors.map(author => {
         return {
           id: author._id,
           name: `${author.firstName} ${author.lastName}`,
           userName: author.userName
         };
       }));
     })
     .catch(err => {
       console.error(err);
       res.status(500).json({ error: 'something went terribly wrong' });
     });
 });


// POST route for authors
app.post('/authors', function(req, res) {
   const requiredFields = ['firstName', 'lastName', 'userName'];
   requiredFields.forEach(field => {
     if (!(field in req.body)) {
       const message = `Missing \`${field}\` in request body`;
       console.error(message);
       return res.status(400).send(message);
     }
   });
 
   Author
     .findOne({ userName: req.body.userName })
     .then(author => {
       if (author) {
         const message = `Username already taken`;
         console.error(message);
         return res.status(400).send(message);
       }
       else {
         Author
           .create({
             firstName: req.body.firstName,
             lastName: req.body.lastName,
             userName: req.body.userName
           })
           .then(author => res.status(201).json({
               _id: author.id,
               name: `${author.firstName} ${author.lastName}`,
               userName: author.userName
             }))
           .catch(err => {
             console.error(err);
             res.status(500).json({ error: 'Something went wrong' });
           });
       }
     })
     .catch(err => {
       console.error(err);
       res.status(500).json({ error: 'something went horribly awry' });
     });
 });

// PUT route for author:
app.put('/authors/:id', function(req, res) {
   if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
     res.status(400).json({
       error: 'Request path id and request body id values must match'
     });
   }
 
   const updated = {};
   const updateableFields = ['firstName', 'lastName', 'userName'];
   updateableFields.forEach(field => {
     if (field in req.body) {
       updated[field] = req.body[field];
     }
   });
 
   Author
     .findOne({ userName: updated.userName || '', _id: { $ne: req.params.id } })
     .then(author => {
       if(author) {
         const message = `Username already taken`;
         console.error(message);
         return res.status(400).send(message);
       }
       else {
         Author
           .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
           .then(updatedAuthor => {
             res.status(200).json({
               id: updatedAuthor.id,
               name: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
               userName: updatedAuthor.userName
             });
           })
           .catch(err => res.status(500).json({ message: err }));
       }
     });
 });

 // DELETE route for authors
 app.delete('/authors/:id', function(req, res) {
   BlogPost
     .remove({ author: req.params.id })
     .then(() => {
       Author
         .findByIdAndRemove(req.params.id)
         .then(() => {
           console.log(`Deleted blog posts owned by and author with id \`${req.params.id}\``);
           res.status(204).json({ message: 'success' });
         });
     })
     .catch(err => {
       console.error(err);
       res.status(500).json({ error: 'something went terribly wrong' });
     });
 });

 // GET route for Posts:
app.get('/posts/:id', function(req, res) {
   BlogPost
       .findById(req.params.id)
       .then(post => {
       res.json({
           id: post._id,
           author: post.authorName,
           content: post.content,
           title: post.title,
           comments: post.comments
       });
       })
       .catch(err => {
       console.error(err);
       res.status(500).json({ error: 'something went horribly awry' });
       });
});

// POST route for posts:
app.post('/posts', function(req, res) {
   const requiredFields = ['title', 'content', 'author_id'];
   requiredFields.forEach(field => {
       if (!(field in req.body)) {
       const message = `Missing \`${field}\` in request body`;
       console.error(message);
       return res.status(400).send(message);
       }
   });

   Author
       .findById(req.body.author_id)
       .then(author => {
       if (author) {
           BlogPost
           .create({
               title: req.body.title,
               content: req.body.content,
               author: req.body.id
           })
           .then(blogPost => res.status(201).json({
               id: blogPost.id,
               author: `${author.firstName} ${author.lastName}`,
               content: blogPost.content,
               title: blogPost.title,
               comments: blogPost.comments
               }))
           .catch(err => {
               console.error(err);
               res.status(500).json({ error: 'Something went wrong' });
           });
       }
       else {
           const message = `Author not found`;
           console.error(message);
           return res.status(400).send(message);
       }
       })
       .catch(err => {
       console.error(err);
       res.status(500).json({ error: 'something went horribly awry' });
       });
});

// PUT route for posts:
app.put('/posts/:id', function(req, res) {
   if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
       res.status(400).json({
       error: 'Request path id and request body id values must match'
       });
   }

   const updated = {};
   const updateableFields = ['title', 'content'];
   updateableFields.forEach(field => {
       if (field in req.body) {
       updated[field] = req.body[field];
       }
   });

   BlogPost
       .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
       .then(updatedPost => res.status(200).json({
       id: updatedPost.id,
       title: updatedPost.title,
       content: updatedPost.content
       }))
       .catch(err => res.status(500).json({ message: err }));
   });


// DELETE route for posts:
app.delete('/posts/:id', function(req, res) {
   BlogPost
       .findByIdAndRemove(req.params.id)
       .then(() => {
       console.log(`Deleted blog post with id \`${req.params.id}\``);
       res.status(204).end();
       });
});


// For all other endpoints NOT found:
app.use('*', (req, res) => { 
   res.status(404).json({ message: 'Not Found' }); 
});


//Server:
let server;

function runServer(databaseUrl, port = PORT) {
   return new Promise(function(resolve, reject) {
      mongoose.connect(databaseUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function(err) {
         if (err) {
            return reject(err);
         }

         server = app
            .listen(port, function() {
               console.log(`Listening on port ${port}...`);
               resolve();
            })

            .on('error', function(err) {
               mongoose.disconnect();
               reject(err);
            });
      });
   });
}

function closeServer() {
   return mongoose.disconnect().then(function() {
      return new Promise(function(resolve, reject) {
         console.log('Closing server');
         server.close(function(err) {
            if (err) {
               return reject(err);
            }
            resolve();
         });
      });
   });
}

if (require.main === module) { 
    runServer(DATABASE_URL).catch(err => console.error(err));
}