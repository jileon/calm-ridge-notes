const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const { TEST_MONGODB_URI } = require('../config');

const Note = require('../models/note');

const { notes } = require('../db/seed/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('sanity check' ,function(){

  console.log('testing sanity');
  it('true should be true', function(){
    expect(true).to.be.true;
  });

  it('1+1 should equal 2', function(){
    expect(1+1).to.equal(2);
  });

});


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
      console.log('RETURN ALL NOTES');
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

  //==================GET api/Notes/id ==============================
  describe('GET /api/notes/:id', function () {
    it('should return correct note', function () {
      console.log('RETURN NOTE BY CORRECT ID');
      let data;
      // 1) First, call the database
      return Note.findOne()
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return chai.request(app).get(`/api/notes/${data.id}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId');

          // 3) then compare database results to API response
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.content).to.equal(data.content);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });
  });

  //==================POST api/notes ==============================
  describe('POST /api/notes', function(){
    it('should create a note in the DB and return it to the user', function(){
      console.log('CREATE NOTE AND RETURN SAME NOTE');

      const newNote = {title: 'Testing New Note in Mocha', content: 'this is new content'};
      let noteRes;
      return chai.request(app)
        .post('/api/notes')
        .send(newNote)
        .then((res)=>{
          noteRes = res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res).to.be.a('object');
          expect(res.body.title).to.equal(newNote.title);
          expect(res.body.content).to.equal(newNote.content);
          expect(res.body.id).to.not.equal(null);
          //console.log(res);
          expect(res).to.have.header('location');
          expect(res.headers.location).to.equal(`/api/notes/${res.body.id}`);
          expect(new Date(res.body.createdAt)).to.not.equal(null);
          expect(new Date(res.body.updatedAt)).to.not.equal(null);
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
          return Note.findById(res.body.id);
        })
        .then((results)=>{
          // console.log(results.id);
          // console.log(noteRes.body.id);
          expect(results.id).to.equal(noteRes.body.id);
          expect(results.title).to.equal(noteRes.body.title);
          expect(results.content).to.equal(noteRes.body.content);
          expect(new Date(results.createdAt)).to.eql(new Date(noteRes.body.createdAt));
          expect(new Date(results.updatedAt)).to.eql(new Date(noteRes.body.updatedAt));
        });

    });
  });


  //==================PUT api/notes/id ==============================
  describe(`update note's fields by id number`, function(){
    it('update correct note located its id, and return updated content', function(){
      const updateNote = {
        title: 'updated title',
        content: 'updated content'
      };

      let dbNote;
      return Note
        .findOne()
        .then(function(dbRes) {
          dbNote= dbRes;
          updateNote.id = dbRes.id;
          return chai.request(app)
            .put(`/api/notes/${dbRes.id}`)
            .send(updateNote);
        })
        .then((res)=>{
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res).to.be.a('object');
          expect(res.body.title).to.equal(updateNote.title);
          expect(res.body.id).to.equal(updateNote.id);
          expect(res.body.content).to.equal(updateNote.content);
          expect(new Date(res.body.createdAt)).to.eql(new Date(dbNote.createdAt));
          return chai.request(app)
            .get(`/api/notes/${res.body.id}`);
        })
        .then((chaiRes)=>{
          expect(chaiRes).to.have.status(200);
          expect(chaiRes).to.be.json;
          expect(chaiRes).to.be.a('object');
          expect(chaiRes.body.title).to.equal(updateNote.title);
          expect(chaiRes.body.id).to.equal(updateNote.id);
          expect(chaiRes.body.content).to.equal(updateNote.content);
        })
    });

  });

  //==================DELETE api/notes/id ==============================
  describe('DELETE BY ID', function() {
   
    it('deletes a notes by id', function() {

      let note;

      return Note
        .findOne()
        .then(function(dbNote) {
          note = dbNote;
          return chai.request(app).delete(`/api/notes/${note.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return Note
            .findById(note.id);
        })
        .then(function(dbNote) {
          expect(dbNote).to.be.null;
          
        });
    });
  });

  //=============================================================
});