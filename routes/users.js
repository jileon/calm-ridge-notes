'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');
const User = require('../models/user');

router.post('/', (req,res,next)=>{
  const {fullname, password, username}= req.body;


  if(!fullname || !username || !password){
    const err = new Error('Missing information in the request body');
    err.status= 400;
    return next(err);
  }

  return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        password: digest,
        fullname
      };
      return User.create(newUser);
    })
    .then(result => {
      return res.status(201).location(`/api/users/${result.id}`).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });

});
    






//====================================
module.exports = router;