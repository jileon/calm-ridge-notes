'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;

  let filter = {};

  if (searchTerm) {
    filter.title = { $regex: searchTerm, $options: 'i' };

  }

  Note.find(filter)
    .sort({ updatedAt: 'desc' })
    .then(results => {
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
  const requiredFields = ["title", "content"];

  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  const newNote = {
    title: req.body.title,
    content: req.body.content
  };

  Note.create(newNote)
    .then(results => {
      res.location(`${req.originalUrl}${results.id}`).status(201).json(results);
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
  const updateableFields = ["title","content"];
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message =
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).json({ message: message });
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
  res.status(204).end();
});

module.exports = router;