const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = require('../server');
const { TEST_MONGODB_URI, JWT_SECRET } = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tags');
const User = require('../models/user');

const { notes, folders, tags, users} = require('../db/seed/data');

const expect = chai.expect;
chai.use(chaiHttp);

describe('sanity check' ,function(){

  console.log('Testing Sanity On Notes');
  it('true should be true', function(){
    expect(true).to.be.true;
  });

  it('1+1 should equal 2', function(){
    expect(1+1).to.equal(2);
  });

});


describe('Connect, createdb, drodb, disconnect', function(){
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

  //==================GET api/Notes ==============================

  describe('GET api/notes/', function(){
     
    it('Should return all notes', function(){
      let allNotes;
      console.log('RETURN ALL NOTES');
      return Note.find({userId: user.id})
        .then((response)=>{
          allNotes = response;

          return chai.request(app)
            .get('/api/notes')
            .set('Authorization', `Bearer ${token}`);
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
      return Note.findOne({userId: user.id})
        .then(_data => {
          data = _data;
          // 2) then call the API with the ID
          return chai.request(app).get(`/api/notes/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;

          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId', 'tags', 'userId');

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

      let newNote= {title: 'hello', content: 'sup'};
      let noteRes;

      return Promise.all([
        Tag.findOne({userId: user.id}),
        Folder.findOne({userId: user.id}), 
      ])
        .then((results)=>{
          newNote.tags = [results[0].id];
          newNote.folderId = results[1].id;

          // console.log(newNote);
          return chai.request(app)
            .post('/api/notes')
            .set('Authorization', `Bearer ${token}`)
            .send(newNote);
        })
        .then((res)=>{
        //  console.log(res.body);
          noteRes = res;
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res).to.be.a('object');
          expect(res.body.title).to.equal(newNote.title);
          expect(res.body.content).to.equal(newNote.content);
          expect(res.body.id).to.not.equal(null);
          expect(res).to.have.header('location');
          expect(res.headers.location).to.equal(`/api/notes/${res.body.id}`);
          expect(new Date(res.body.createdAt)).to.not.equal(null);
          expect(new Date(res.body.updatedAt)).to.not.equal(null);
          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId', 'tags', 'userId');
          return Promise.resolve( Note.findOne({_id: res.body.id, userId: user.id}));
        })
        .then((results)=>{
        
          expect(results.id).to.equal(noteRes.body.id);
          expect(results.title).to.equal(noteRes.body.title);
          expect(results.content).to.equal(noteRes.body.content);
          expect(new Date(results.createdAt)).to.eql(new Date(noteRes.body.createdAt));
          expect(new Date(results.updatedAt)).to.eql(new Date(noteRes.body.updatedAt));
          
        });
    });
  });


  //==================PUT api/notes/id ==============================
  describe('update note\'s fields by id number', function(){
    it('update correct note located its id, and return updated content', function(){


      let updateNote= {title: 'hi', content: 'I like Cake'};
      let dbNote;

      return Promise.all([
       
        Tag.findOne({userId: user.id}),
        Folder.findOne({userId: user.id}), 
        Note.findOne({userId: user.id})
      ])
        .then((results)=>{
          updateNote.tags = [results[0].id];
          updateNote.folderId = results[1].id;
          updateNote.id= results[2].id;

          // console.log(newNote);
          return chai.request(app)
            .put(`/api/notes/${updateNote.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateNote);
        })
        .then((res)=>{
          dbNote= res.body;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res).to.be.a('object');
          expect(res.body.title).to.equal(updateNote.title);
          expect(res.body.id).to.equal(updateNote.id);
          expect(res.body.content).to.equal(updateNote.content);
          expect(new Date(res.body.createdAt)).to.eql(new Date(dbNote.createdAt));
          return chai.request(app)
            .get(`/api/notes/${res.body.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then((chaiRes)=>{
          expect(chaiRes).to.have.status(200);
          expect(chaiRes).to.be.json;
          expect(chaiRes).to.be.a('object');
          expect(chaiRes.body.title).to.equal(updateNote.title);
          expect(chaiRes.body.id).to.equal(updateNote.id);
          expect(chaiRes.body.content).to.equal(updateNote.content);
        });
    });

  });

  //==================DELETE api/notes/id ==============================
  describe('DELETE BY ID', function() {
   
    it('deletes a notes by id', function() {

      let note;

      return Note
        .findOne({userId: user.id})
        .then(function(dbNote) {
          note = dbNote;
          return chai.request(app).delete(`/api/notes/${dbNote.id}`)
          .set('Authorization', `Bearer ${token}`)
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