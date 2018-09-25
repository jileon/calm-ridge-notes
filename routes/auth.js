'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config')
const {JWT_EXPIRY} = require('../config');


function createAuthToken(user){
  return jwt.sign({user}, JWT_SECRET, {
    subject:user.username,
    expiresIn: JWT_EXPIRY
  });
}


const options = {session: false, failWithError: true};

const localAuth = passport.authenticate('local', options);

router.post('/',localAuth, (req,res,next)=>{
  const authToken =createAuthToken(req.user);
  //same as res.json(authToken.authToken);
  return res.json({ authToken});
});

const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });

router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});


module.exports= router;