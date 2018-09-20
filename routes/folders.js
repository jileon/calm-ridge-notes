'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Folder = require('../models/folder');

/* ========== GET/READ ALL ITEMS ========== */

// router.get('/', (req,res,next)=>{
//   Folder.find().sort({name: 'desc'})
//     .then((results)=>{
//       res.json(results);
//     })
//     .catch(err => next(err));

// });

module.exports = router;