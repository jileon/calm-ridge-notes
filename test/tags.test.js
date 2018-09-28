const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');
const { TEST_MONGODB_URI, JWT_SECRET} = require('../config');
const {notes,tags, folders, users} = require('../db/seed/data');
const Note = require('../models/note');
const Tag = require('../models/tags');
const Folder = require('../models/folder');
const User = require('../models/user');
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
  
    let token;
    let user;

    beforeEach(function () {
      return Promise.all([
        User.insertMany(users),
        Folder.insertMany(folders),
        Folder.createIndexes(),
        Tag.insertMany(tags),
        Tag.createIndexes(),
        Note.insertMany(notes)
      ])
        .then(([users]) => {
          user = users[0];
          token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
        });
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
          .set('Authorization', `Bearer ${token}`)
          .then(response=>{
            expect(response).to.be.json;
            expect(response.body).to.be.a('array');
            expect(response.body[0]).to.be.a('object');
            expect(response.body[0]).to.have.keys('name', 'createdAt', 'updatedAt', 'id', 'userId');
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
            return chai.request(app).get(`/api/tags/${tag.id}`)
              .set('Authorization', `Bearer ${token}`);
          })
          .then((res) => {
            expect(res).to.be.json;
            expect(res.body).to.be.an('object');
            expect(res.body.id).to.equal(tag.id);
            expect(res.body.name).to.equal(tag.name);
            expect(res.body).to.have.all.keys('id', 'name', 'createdAt', 'updatedAt', 'userId');
            expect(new Date(res.body.createdAt)).to.deep.equal(tag.createdAt);
            expect(new Date(res.body.updatedAt)).to.deep.equal(tag.updatedAt);
            expect(res).to.have.status(200);
          });
      });
    });

    /*==================POST api/tags =============================*/

    describe('POST /api/tags/', function(){

      it('create and return new tag', function(){
        const newTag = {name: "BrandNewTag"};
        let tagRes;
        return chai.request(app).post('/api/tags')
          .set('Authorization', `Bearer ${token}`)
          .send(newTag)
          .then(response=>{
            tagRes= response;
            expect(response).to.be.json;
            expect(response).to.have.status(200);
            expect(response).to.have.header('location');
           
            // console.log(response.body);
            expect(response.header.location).to.equal(tagRes.header.location);
            expect(response.body.name).to.equal(newTag.name);
            expect(new Date(response.body.createdAt)).to.not.equal(null);
            expect(new Date(response.body.updatedAt)).to.not.equal(null);
            expect(response.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt', 'userId');
            return Tag.find({userId: user.id, _id:tagRes.body.id})
              .set('Authorization', `Bearer ${token}`)
              .then(([tagDbRes])=>{
                // console.log(tagDbRes);
                expect(tagDbRes.id).to.equal(tagRes.body.id);
                expect(tagDbRes.name).to.equal(tagRes.body.name);
              });
          });
          
      });
    });

    /*==================UDATE/PUT api/tags by ID====================*/

    describe('PUT api/tags:id', function(){
      it('update correct tag located its id, and return updated tag', function(){
        const updateTag = {name: 'updated name test'};
      
        let dbTag;
        return Tag
          .findOne({userId: user.id})
          .then(function(dbRes) {
            dbTag= dbRes;
            return chai.request(app)
              .put(`/api/tags/${dbRes.id}`)
              .set('Authorization', `Bearer ${token}`)
              .send(updateTag);
          })
          .then((res)=>{
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res).to.be.a('object');
            expect(res.body.name).to.equal(updateTag.name);
            expect(new Date(res.body.createdAt)).to.eql(new Date(dbTag.createdAt));
            return chai.request(app)
              .get(`/api/tags/${dbTag.id}`)
              .set('Authorization', `Bearer ${token}`);
          })
          .then((chaiRes)=>{
            expect(chaiRes).to.have.status(200);
            //console.log(chaiRes.body);
            expect(chaiRes).to.be.json;
            expect(chaiRes).to.be.a('object');
            expect(chaiRes.body.name).to.equal(updateTag.name);
            
  
          });
      });
  
    });
    


    /*==================DELETE api/tags by ID====================*/
    describe('DELETE /api/tags/:id', function() {
 
      it('deletes a folder by id', function() {
  
        let tag;
  
        return Tag
          .findOne({userId: user.id})
          .then(dbRes=>{
            tag = dbRes;
            return chai.request(app).delete(`/api/tags/${dbRes.id}`)
              .set('Authorization', `Bearer ${token}`);
          })
          .then((response)=>{
            expect(response).to.have.status(204);
            return chai.request(app).get(`/api/tags/${tag.id}`)
              .set('Authorization', `Bearer ${token}`);
          })
          .then(response=>{
            expect(response.body).to.be.null;
            return Tag.findById(tag.id);
          })
          .then(dbRes=>{
            expect(dbRes).to.be.null;
          });
      });
    });


    //Need to add negative case testing
    //==================================
  });