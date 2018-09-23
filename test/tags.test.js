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
      return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true })
        .then(() => mongoose.connection.db.dropDatabase());
    });
  
    beforeEach(function () {
      return Promise.all([
        Tag.insertMany(tags),
        Tag.createIndexes(),
        Note.insertMany(notes),
      ]);
    });
  
    afterEach(function () {
      return mongoose.connection.db.dropDatabase();
    });
  
    after(function () {
      return mongoose.disconnect();
    });
    /*==================GET api/tags ==============================*/
    describe('GET /api/tags', function(){

      it('Get All Tags', function(){
        return chai.request(app)
          .get('/api/tags')
          .then(response=>{
            expect(response).to.be.json;
            expect(response.body).to.be.a('array');
            expect(response.body[0]).to.be.a('object');
            expect(response.body[0]).to.have.keys('name', 'createdAt', 'updatedAt', 'id');
          });
      });
      
    });

    /*==================GET api/tags by ID ==========================*/

    describe('it should retrieve correct tag belonging to a certain id', function(){

  
      it('should return correct tags', function () {
        let tag;
        return Tag.findOne()
          .then(result => {
            tag = result;
            return chai.request(app).get(`/api/tags/${tag.id}`);
          })
          .then((res) => {
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body.id).to.equal(tag.id);
            expect(res.body.name).to.equal(tag.name);
            expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt');
            expect(new Date(res.body.createdAt)).to.deep.equal(tag.createdAt);
            expect(new Date(res.body.updatedAt)).to.deep.equal(tag.updatedAt);
            expect(res).to.have.status(200);
          });
      });
    });

    /*==================POST api/tags =============================*/

    describe('POST /api/tags/', function(){

      it.only('create and return new tag', function(){
        const newTag = {name: "BrandNewTag"};
        let tagRes;
        chai.request(app).post('/api/tags')
          .send(newTag)
          .then(response=>{
            tagRes= response;
            expect(response).to.be.json;
            expect(response).to.have.status(200);
            expect(response).to.have.header('location');
            //console.log(response);
            expect(response.header.location).to.equal(tagRes.header.location);
            expect(new Date(response.body.createdAt)).to.not.equal(null);
            expect(new Date(response.body.updatedAt)).to.not.equal(null);
            expect(response.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
            return Tag.findById(tagRes.body.id)
          })
          .then((tagDbRes)=>{
            expect(tagDbRes.id).to.equal(tagRes.body.id);
            expect(tagDbRes.name).to.equal(tagRes.body.name);
          });
      });
    });

    /*==================UDATE/PUT api/tags by ID====================*/



    /*==================DELETE api/tags by ID====================*/

    //==================================
  });
