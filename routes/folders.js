'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Folder = require('../models/folder');

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
  const requiredField = "name";

  const newFolder = {
    name: req.body.name
  };
  
  if (!(requiredField in req.body)) {
    const message = `Missing \`${requiredField}\` in request body`;
    console.error(message);
    return res.status(400).send(message);
  }

  Folder.findOne(newFolder)
    .then((result)=>{
      if(result === null){
        Folder.create(newFolder)
          .then(newFolder => {
            console.log(req.originalUrl);
            res.location(`${req.originalUrl}/${newFolder.id}`).status(201).json(newFolder);
          });
      } 
      if (result !== null){
        const message = `Folder Name Already exists`;
        console.error(message);
        return res.status(400).send(message);
      }
    })
    .catch(err => {
      next(err);
    });
  
});





//=============================================
module.exports = router;