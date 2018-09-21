'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

/* ========== GET/READ ALL ITEMS ========== */
// router.get('/', (req, res, next) => {
//   const { searchTerm, folderId } = req.query;
 
//   const searchQuery = new RegExp(`${searchTerm}`, 'gi');


//   let filter = {};

//   if (searchTerm) {
//     filter.title = { $regex: searchQuery };
//     filter.content = { $regex: searchQuery };
//   }

//   if (folderId) {
//     filter.folderId= folderId ;
//   }

//   console.log(filter);
//   // .find({title: { '$regex': /gaga/gi }})

//   Note.find({$or: [{title: filter.title}, {content: filter.content} ]})
//     .sort({ updatedAt: 'desc' })
//     .then(results => {
//       res.json(results);
//     })
//     .catch(err => {
//       next(err);
//     });
// });


router.get('/', (req, res, next) => {
  const {folderId} = req.query;
  const { searchTerm} = req.query;

  let filter = {};

  if (searchTerm) {
    // filter.title = { $regex: searchTerm, $options: 'i' };
    filter.title = { $regex: 'Lady Gaga', $options: 'i' };

    // Mini-Challenge: Search both `title` and `content`
    const re = new RegExp('Lady Gaga', 'i');
    filter.$or = [{ 'title': re }, { 'content': re }];
  }

  if (folderId) {
    filter.folderId = folderId;
  }

  Note.find(filter)
  
    .sort({ updatedAt: 'desc' })
    .then(results => {
      console.log("===========" + JSON.stringify(filter));
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET NOTE BY ID ========== */
router.get('/:id', (req, res, next) => {
  const noteId = req.params.id;
  Note.findById(noteId)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});
/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const { title, content, folderId } = req.body;
  const requiredFields = ["title", "content"];

  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  // if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
  //   const err = new Error('The `folderId` is not valid');
  //   err.status = 400;
  //   return next(err);
  // }

  const newNote = {
    title: title,
    content: content,
    folderId: folderId
  };

  Note.create(newNote)
    .then(results => {
      console.log(req.originalUrl);
      res.location(`${req.originalUrl}/${results.id}`).status(201).json(results);
    })
    .catch(err => {
      next(err);
    });
  console.log('Create a Note');
  

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const updateId = req.params.id;
  const updateNote = {};
  const updateableFields = ["title","content", "folderId"];
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message =
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }

  if (updateNote.folderId && !mongoose.Types.ObjectId.isValid(updateNote.folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateNote[field] = req.body[field];
    }
  });


  Note.findByIdAndUpdate(updateId ,{$set: updateNote}, {new: true})
    .then((results)=>{
      res.json(results);
    })
    .catch(err => {
      next(err);
    });

});
  

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  console.log('Delete a Note');
  const deleteId = req.params.id;

  Note.findByIdAndDelete(deleteId)
    .then(()=>{
      res.status(204).end();
    })
    .catch(err => res.status(500).json({ message: "Internal server error" }));
  
});

module.exports = router;