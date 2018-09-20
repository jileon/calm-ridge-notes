'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const Folder = require('../models/folder');
const Note = require('../models/note');

/* ========== GET/READ ALL FOLDERS ========== */

router.get('/', (req,res,next)=>{
  Folder.find().sort({name: 'asc'})
    .then((results)=>{
      res.json(results);
    })
    .catch(err => next(err));

});


/* ========== GET/READ BY FOLDER ID ========== */
router.get('/:id', (req,res,next)=>{
  const folderId = req.params.id;
    
  if (folderId.length !== 24){
    const message = `${folderId} is not a valid id.`;
    console.error(message);
    return res.status(400).send(message);
  }

  
  Folder.findById(folderId)
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
  const newFolder = {name: req.body.name };
  
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
  const updateFolder = {name: req.body.name};

  if (!(requiredField in req.body)) {
    const message = `Missing \`${requiredField}\` in request body`;
    console.error(message);
    return res.status(400).send(message);
  }
  if (updateId.length !== 24){
    const message = `${updateId} is not a valid id.`;
    console.error(message);
    return res.status(400).send(message);
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
  
  Note.deleteMany({folderId: deleteId})
    .then(()=>{
      Folder.findByIdAndDelete(deleteId);
    })
    .then(()=>{
      res.status(204).end();
    })
    .catch(err => res.status(500).json({ message: 'Internal server error' }));
    
});
//=============================================
module.exports = router;