'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const Note = require('../models/note');
const Folder= require('../models/folder');
const Tag= require('../models/tags');


router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));


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
  const { tagId} = req.query;
  const userId = req.user.id;
  

  let filter = {};
  filter.userId = userId;

  if (searchTerm) {
    //filter.title = { $regex: searchTerm, $options: 'i' };
    //filter.title = { $regex: 'Lady Gaga', $options: 'i' };

    // Mini-Challenge: Search both `title` and `content`
    const re = new RegExp(`${searchTerm}`, 'i');
    filter.$or = [{ 'title': re }, { 'content': re }];
  }

  if (folderId) {
    filter.folderId = folderId;
  }
  if (tagId) {
    filter.tags = tagId;
  }

  Note.find(filter)
  
    .sort({ updatedAt: 'desc' })
    .populate('tags', 'name')
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
  const userId = req.user.id;
  if(noteId && !mongoose.Types.ObjectId.isValid(noteId)){
    const err = new Error('The `Note Id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.find({userId: userId, _id: noteId})
    .populate('tags', 'name')
    .then(results => {
      res.json(results[0]);
    })
    .catch(err => {
      next(err);
    });
});
/* ========== POST/CREATE AN ITEM ========== */

router.post('/', (req, res, next) => {
  let { title, content, folderId, tags } = req.body;
  const userId = req.user.id;
  folderId= folderId=== '' ? null : folderId;
  tags = ((!tags))? []: tags;

  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }

  
  if(tags){
    tags.forEach(tag=>{
      if (!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error(' A `tagId` in the body is not valid');
        err.status = 400;
        return next(err);
      }
    });

    if (!Array.isArray(tags)){
      const err = new Error('Tags is not an Array');
      err.status = 400;
      return next(err);
    }
  }
 
    
  const newNote = { 
    title, 
    content,
    folderId,
    tags,
    userId
  };



  Folder.find({_id: folderId, userId})
    .then((result)=>{
      if (result.length < 1){
        const err = new Error('The `folderId` is not valid');
        err.status = 400;
        return next(err);
      }
    })
    .then(()=>{
      tags.forEach(tag=>{
        Tag.find({_id: tag, userId})
          .then(result=> { 
            if(result.length<1)
            {const err = new Error(' A `tagId` in the body not valid');
              err.status = 400;
              return next(err);}
          });
      });
    })
    .then(()=>{
      return Note.create(newNote)
        .then(result => {
          res.location(`${req.originalUrl}/${result.id}`)
            .status(201)
            .json(result);
        });
    })
    .catch(err => {
      next(err);
    });



  

    
 





  //===========================
});



/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const updateId = req.params.id;
  const updateNote = {};
  const updateableFields = ['title','content', 'folderId', 'tags'];
  const userId = req.user.id;
  
  updateableFields.forEach(field => {
    if (field in req.body) {
      updateNote[field] = req.body[field];
    }
  });
  
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = `Request path id (${req.params.id}) and request body id ${req.body.id} must match`;
    console.error(message);
    return res.status(400).json({ message: message });
  }

  if (updateNote.folderId && !mongoose.Types.ObjectId.isValid(updateNote.folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }


  if (updateNote.folderId === '') {
    delete updateNote.folderId;
    updateNote.$unset = {folderId : 1};
  }


  if ( req.body.tags && !Array.isArray(req.body.tags)){
    const err = new Error('Tags is not an Array');
    err.status = 400;
    return next(err);
  }

  if (updateNote.tags){
    updateNote['tags'].forEach(tag=>{

      if (!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error('The `Tag Id` is not valid');
        err.status = 400;
        return next(err);
      }
    });
  }

  Folder.find({_id: updateNote.folderId, userId})
    .then((result)=>{
      if (result.length < 1){
        const err = new Error('The `folderId` is not valid');
        err.status = 400;
        return next(err);
      }
    })
    .then(()=>{
      if(updateNote.tags){
        updateNote['tags'].forEach(tag=>{
          Tag.find({_id: tag, userId})
            .then(result=> { 
              if(result.length<1)
              {const err = new Error(' A `tagId` in the body not valid');
                err.status = 400;
                return next(err);}
            });
        });
      }
    })
    .then(()=>{
      return Note.findOneAndUpdate({userId: userId , _id: updateId},{$set: updateNote}, {new: true})
        .then(results => {
          res.json(results);
        });
    })
    .catch(err => {
      next(err);
    });


  
 




});

  
// Category.findOne({_id: req.params.category , 'retailers._id' : req.params.id}
/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  console.log('Delete a Note');
  const deleteId = req.params.id;
  const userId = req.user.id;

  Note.findOneAndRemove({ _id: deleteId, userId:userId})
    .then(()=>{
      res.status(204).end();
    })
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
  
});

module.exports = router;