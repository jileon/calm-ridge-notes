const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { Test_MONGODB_URI} = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tags');

const {notes} = require('../db/seed/data');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Sanity Check On Tags', function (){
  console.log('Testing Sanity on Tags');

  it('should be true', function(){
    expect(true).to.be.true;
  });
    
  it('5+5 equal 10', function(){
    expect(5+5).to.equal(10);
  });
});
