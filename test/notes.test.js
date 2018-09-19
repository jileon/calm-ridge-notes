const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');

const { notes } = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);

// describe('sanity check' ,function(){

//   console.log('testing sanity');
//   it('true should be true', function(){
//     expect(true).to.be.true;
//   });

//   it('1+1 should equal 2', function(){
//     expect(1+1).to.equal(2);
//   });

// });


describe('Connect, createdb, drodb, disconnect', function(){
  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });
    
  beforeEach(function () {
    return Note.insertMany(notes);
  });
    
  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });
    
  after(function () {
    return mongoose.disconnect();
  });

  //==================GET api/Notes ==============================

  describe('GET api/notes/', function(){
     
    it('Should return all notes', function(){
      let allNotes;
      console.log('return all Notes');
      return Note.find()
        .then((response)=>{
          allNotes = response;
          return chai.request(app)
            .get('/api/notes');
        })
        .then((res)=>{
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);
          expect(res.body[0]).to.be.a('object');
          expect(res.body.length).to.equal(allNotes.length);
        });
    });
  });


// describe('GET /api/notes/:id', function () {
//     it('should return correct note', function () {
//       let data;
//       // 1) First, call the database
//       return Note.findOne()
//         .then(_data => {
//           data = _data;
//           // 2) then call the API with the ID
//           return chai.request(app).get(`/api/notes/${data.id}`);
//         })
//         .then((res) => {
//           expect(res).to.have.status(200);
//           expect(res).to.be.json;

//           expect(res.body).to.be.an('object');
//           expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');

//           // 3) then compare database results to API response
//           expect(res.body.id).to.equal(data.id);
//           expect(res.body.title).to.equal(data.title);
//           expect(res.body.content).to.equal(data.content);
//           expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
//           expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
//         });
//     });
//   });













  //=============================================================
});