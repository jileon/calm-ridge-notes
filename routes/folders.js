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









//=============================================
module.exports = router;