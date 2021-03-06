'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const { MONGODB_URI } = require('../config');
const Folder = require('../models/folder');
const Note = require('../models/note');

router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));
/* ========== GET/READ ALL FOLDERS ========== */

router.get('/', (req,res,next)=>{
  const userId = req.user.id;

  //same as {userId: userId}
  Folder.find({userId}).sort({name: 'asc'})
    .then((results)=>{
      res.json(results);
    })
    .catch(err => next(err));

});


/* ========== GET/READ BY FOLDER ID ========== */
router.get('/:id', (req,res,next)=>{
  const folderId = req.params.id;
  const userId = req.user.id;
    
  // if (folderId.length !== 24){
  //   const message = `${folderId} is not a valid id.`;
  //   console.error(message);
  //   return res.status(400).send(message);
  // }


  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error(`Folder Id: ${folderId} is not valid`);
    err.status = 400;
    return next(err);
  }

  //same as Folder.findOne({_id: folderId, userId: userId})** below we are using object destructuring
  //can also use Fold.find(), but results come back in an array
  Folder.findOne({_id: folderId, userId})
    .then((results)=>{
      if (results===null){
        const message = `Nothing found with id ${folderId} `;
        console.error(message);
        return res.status(404).send(message);
      }else{
        res.json(results);
        return res.status(200);
      }
    })
    .catch(err => {
      next(err);
    });
  
});

/* ========== POST NEW FOLDER ========== */

router.post('/', (req, res, next) => {
  const requiredField = 'name';
  const userId = req.user.id;

  const newFolder = {name: req.body.name, userId };
  if (!(requiredField in req.body)) {
    const message = 'Missing name in request body';
    console.error(message);
    return res.status(400).send(message);
  }


  Folder.create(newFolder)
    .then(newFolder => {
      console.log(req.originalUrl);
      res.location(`${req.originalUrl}/${newFolder.id}`).status(201).json(newFolder);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('Folder name already exists');
        err.status = 400;
      }
      next(err);
    });
  
});


/* ========== PUT/UPDATE EXISTING FOLDER ========== */
router.put(('/:id'), (req,res,next)=>{
  const requiredField = 'name';
  const updateId = req.params.id;
  const userId = req.user.id;


  const updateFolder = {name: req.body.name, userId};


  if (!(requiredField in req.body)) {
    const message = `Missing \`${requiredField}\` in request body`;
    console.error(message);
    return res.status(400).send(message);
  }

  if (updateId && !mongoose.Types.ObjectId.isValid(updateId)) {
    const err = new Error(`Folder Id: ${updateId} is not valid`);
    err.status = 400;
    return next(err);
  }


  Folder.findByIdAndUpdate(updateId, {$set:updateFolder}, {new: true})
    .then((results)=>{
      res.json(results);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('Folder name already exists');
        err.status = 400;
      }
      next(err);
    });
     
});
/* ========== DELETE FOLDER ========== */

router.delete('/:id', (req, res, next) => {
  console.log('Delete a Note');
  const deleteId = req.params.id;
  const userId = req.user.id;
  

  //======On Cascade delete option=====
  //   Note.deleteMany({folderId: deleteId})
  //     .then(()=>{
  //       Folder.findByIdAndDelete(deleteId)
  //         .then(()=>{
  //           res.status(204).end();
  //         });
  //     })
  //     .catch(err => res.status(500).json({ message: 'Internal server error' }));
   
  //

  //======Delete Folder, but keep the note associated with that folder=====
  Note.updateMany({userId, folderId: deleteId}, {$unset: {folderId: ""}})
    .then(()=>{
      Folder.findOneAndRemove({_id: deleteId, userId})
        .then(()=>{
          res.status(204).end();
        });
    })
    .catch(err => {
      res.status(500).json({ message: 'Internal server error' });
      console.log(err);
    });
});
//=============================================
module.exports = router;