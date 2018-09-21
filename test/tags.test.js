const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI} = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tags');

const {notes, folders, tags} = require('../db/seed/data');

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

describe('Connect, createDb, read/update/delete from db, drobDb, disconnect', 
  function(){

    before(function () {
      return mongoose.connect(TEST_MONGODB_URI)
        .then(() => mongoose.connection.db.dropDatabase());
    });

    beforeEach(function () {
      return Promise.all([
        Note.insertMany(notes),
    
        Folder.insertMany(folders),
        Folder.createIndexes(),
    
        Tag.insertMany(tags),
        Tag.createIndexes()
      ]);
    });

    afterEach(function(){
      return mongoose.connection.db.dropDatabase;
    });

    after(function(){
      return mongoose.disconnect();
    });

    /*==================GET api/tags ==============================*/
    describe('Should return all Tags', function(){

      it('Get All Tags', function(){
        return chai.request(app)
          .get('/api/folders')
          .then(response=>{
            expect(response).to.be.json;
            expect(response.body).to.be.a('array');
            expect(response.body[0]).to.be.a('object');
            expect(response.body[0]).to.have.keys('name', 'createdAt', 'updatedAt', 'id');
          });
      })
        


    });



    //==================================
  });
