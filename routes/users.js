'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const User = require('../models/user');

router.post('/', (req,res,next)=>{
 const {fullname, password, username}= req.body;

  const newUser = 
  { fullname: fullname,
    username: username,
    password: password
  };


  if(!fullname || !username || !password){
    const err = new Error('Missing information in the request body');
    err.status= 400;
    return next(err);
  }


  User.create(newUser)
    .then(newUser => {
      console.log(req.originalUrl);
      res.location(`${req.originalUrl}/${newUser.id}`).status(201).json(newUser);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('User name already exists');
        err.status = 400;
      }
      next(err);
    });

});
    
// });





//====================================
module.exports = router;