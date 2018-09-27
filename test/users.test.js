
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const User = require('../models/user');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Noteful API - Users', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const fullname = 'Example User';

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return User.createIndexes();
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });
  
  describe('/api/users', function () {
    describe('POST', function () {
      it('Should create a new user', function () {
        const testUser = { username, password, fullname };

        let res;
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(_res => {
            res = _res;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('id', 'username', 'fullname');

            expect(res.body.id).to.exist;
            expect(res.body.username).to.equal(testUser.username);
            expect(res.body.fullname).to.equal(testUser.fullname);

            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.exist;
            expect(user.id).to.equal(res.body.id);
            expect(user.fullname).to.equal(testUser.fullname);
            return user.validatePassword(password);
          })
          .then(isValid => {
            expect(isValid).to.be.true;
          });
      });
      it('Should reject users with missing username', function () {
        const testUser = { password, fullname };
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            //console.log(res);
            expect(res.error).to.not.be.false;
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Missing username in the request body');
          });
        
      });

      /**
       * COMPLETE ALL THE FOLLOWING TESTS
       */
      it('Should reject users with missing password', function(){
        const testUser = { username};
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .then(res=>{
            // console.log(res.body);
            expect(res.error).to.not.be.false;
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Missing password in the request body');
          });
      });

      it('Should reject users with non-string username', function(){
        const testUser = {username:1234, password: 'examplePass'};

        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .then((res)=>{
            expect(res).to.have.status(400);
          
          });
      });
      it('Should reject users with non-string password', function(){
        const testUser = {username, password: 123456789};

        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .then(res=>{
            expect(res).to.have.status(400);
          });
      });
      it('Should reject users with non-trimmed username', function(){
        const testUser = {username: 'abcdefg   ', password};
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .then(res=>{
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Please remove uneccessary spaces from your username');
          });
      });
      it('Should reject users with non-trimmed password', function(){
        const testUser = {username, password: '   abc123456  '};
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .then(res=>{
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Please remove uneccessary spaces from your password');
          });
      });
      it('Should reject users with empty username', function(){
        const testUser = {username: '' , password};
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .then(res=>{
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Username is too short');
          });
      });
      it('Should reject users with password less than 8 characters', function(){
        const testUser = {username, password: '1'};
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .then(res=>{
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Password is too short. Must be a minimum of eight characters');
          });
      });
      it('Should reject users with password greater than 72 characters', function(){
        const testUser = {username, password: '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890'};
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .then(res=>{
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('Password is too long. Must be shorter than 72 characters');
          });
      });
      it('Should reject users with duplicate username', function(){
        //const testUser = {fullname, username, password}; Why doesn't this work?

        User.create({fullname: 'Kanet Leon', username: 'abc123', password: '12345678'})
          .then((res)=>{ 
            console.log("hello");
          });
        return chai.request(app)
          .post('/api/users')
          .send({fullname: 'Kanet Leon', username: 'abc123', password: '12345678'})
          .then((res)=>{
            expect(res).to.have.status(400);
          });
      });
      it('Should trim fullname', function(){
        const testUser = {fullname:'    trimName   ' , username, password}
        return chai.request(app)
          .post('/api/users')
          .send(testUser)
          .then (res=>{
            expect(res.body.fullname).to.equal(testUser.fullname.trim());
          });

      });
    });
  });
});