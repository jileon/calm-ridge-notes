'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const { MONGODB_URI } = require('../config');
const Folder = require('../models/folder');
const Note = require('../models/note');
const Tag = require('../models/tags');

router.use(passport.authenticate('jwt', { session: false, failWithError: true }));


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

/* ========== POST TAGS========== */

router.post('/', (req,res,next)=>{
  const {name}= req.body;
  
  if(!name){
    const err = new Error('Missing name in request body');
    err.status= 400;
    return next(err);
  }
  const newTag= {name};
  
  Tag.create(newTag)
    .then(results=>{
      res.location(`${req.originalUrl}/${results.id}`).json(results);
    })
    .catch(err=> {
      if(err.code ===11000){
        const message = 'That tag name already exists';
        err.status = 400;
        return res.status(400).send(message);
      }
      next(err);
    });

});
/* ========== PUT/UPDATE TAGS by ID========== */

router.put('/:id', (req,res,next)=>{
  const updateId = req.params.id;
  const updateName = req.body.name;
  const updateTag = {};

  if(req.body.name){
    updateTag.name = updateName;
  
  }

  if(!req.body.name){
    const err = new Error('Name is missing in request body');
    err.status = 400;
    return next(err);
  }

  if(updateId && !mongoose.Types.ObjectId.isValid(updateId)){
    const err = new Error('The `tagId` is not valid');
    err.status = 400;
    return next(err);
  }

  
  Tag.findByIdAndUpdate(updateId, {$set:updateTag}, {new: true})
    .then(results=>{
      res.json(results);
    })
    .catch(err=>{
      if(err.code ===11000){
        const message = 'That tag name already exists';
        err.status = 400;
        return res.status(400).send(message);
      }
    });
});

/* ========== Delete TAGS by ID========== */
router.delete('/:id', (req,res,next)=>{
  const deleteId = req.params.id;

  if(deleteId && !mongoose.Types.ObjectId.isValid(deleteId)){
    const message = `${deleteId} is not valid`;
    const err =  new Error (message);
    err.status= 400;
    return next(err);
  }

  

  Tag.findByIdAndDelete(deleteId)
    .then(()=>{
      
      return Note.updateMany({tags: deleteId},{ $pull: { tags: { $in: [ deleteId ] } } });
    })
    .then(()=>{
      res.status(204).end();
    })
    .catch(err=> next(err));
});


/*========== Export Tags Router==========*/
module.exports=router;