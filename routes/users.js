'use strict';

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const { MONGODB_URI } = require('../config');
const User = require('../models/user');



router.post('/', (req,res,next)=>{
  const {fullname, password, username}= req.body;
  const requiredFields = ['username', 'password'];


  requiredFields.forEach(field=>{
    if (!(field in req.body)){
      const err = new Error(`Missing ${field} in the request body`);
      err.status= 400;
      return next(err);
    }
  });

  const trimmedUN = username.trim();
  if(trimmedUN.length !== username.length){
    const err = new Error('Please remove uneccessary spaces from your user name');
    err.status= 400;
    return next(err);
  }

  const trimmedPW = password.trim();
  if(trimmedPW.length !== password.length){
    const err = new Error('Please remove uneccessary spaces from your password');
    err.status= 400;
    return next(err);
  }

  if(username.length < 1){
    const err = new Error('Username is too short');
    err.status= 400;
    return next(err);
  }

  if(password.length < 8){
    const err = new Error('Password is too short. Must be a minimum of eight characters');
    err.status= 400;
    return next(err);
  }

  if(password.length >72){
    const err = new Error('Password is too long. Must be shorter than 72 characters');
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