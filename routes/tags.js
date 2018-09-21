'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Folder = require('../models/folder');
const Note = require('../models/note');
const Tag = require('../models/tags');

/* ========== GET/READ TAGS========== */

router.get('/', (req,res,next)=>{
  Tag.find().sort({name: 'asc'})
    .then((results)=>{
      res.json(results);
    })
    .catch(err => next(err));
  
});

/* ========== GET/READ TAGS by ID========== */

router.get('/:id', (req,res,next)=>{
  const tagId = req.params.id;

  if (tagId && !(mongoose.Types.ObjectId.isValid(tagId))) {
    const err = new Error('The `tagId` is not valid');
    err.status = 400;
    return next(err);
  }

  Tag.findById(tagId)
    .then(results =>{
      res.json(results);
    })
    .catch(err=> next(err));
});









module.exports=router;