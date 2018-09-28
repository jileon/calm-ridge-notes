const mongoose = require('mongoose');
const chai = require('chai');
const chaiHTTP = require('chai-http');
const { TEST_MONGODB_URI, JWT_SECRET} = require('../config');
const app = require('../server');
const User = require('../models/user');


const expect= chai.expect;

chai.use(chaiHTTP);


describe('Sanity Check On Login', function (){
  console.log('Testing Sanity on Login');
  
  it('should be true', function(){
    expect(true).to.be.true;
  });
      
  it('5+5 equal 10', function(){
    expect(5+5).to.equal(10);
  });
});

describe('Create new users, login existingusers', function(){
 

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true })
      .then(() => mongoose.connection.db.dropDatabase());
  });

  //This below does not work when retrieving, but works when creating?
  //   const testUser = {
  //     username : 'TestUser',
  //     firstName:'TestFirstName',
  //     lastName :'TestLastName'
  //   };
  // let password= 'TestPass';

  // beforeEach(function () {
  //   return User.hashPassword(password)
  //     .then((pass)=>{
  //      testUser.password = pass;
  //       User.create(testUser);
  //     });

  // });

  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';

  beforeEach(function () {
    return User.hashPassword(password)
      .then(password =>
        User.create({
          username,
          password,
          firstName,
          lastName
        })
      );
  });


  afterEach(function(){
    // return mongoose.connection.db.dropDatabase();
    return User.remove({});
  });

  after(function () {
    return mongoose.disconnect();
  });
    
  //=================================================
  describe('Check for User created in db', function(){

    it('Give me back a created User', function(){
      User.find()
        .then((result)=>{
          return console.log(result[0]);
        });
    }); 
  });



  //====================POST Api/Login=============================
  
  describe('/api/login', function () {
    it('Should reject requests with no credentials', function () {
      return chai
        .request(app)
        .post('/api/login')
        .send({})
        .then((res) =>{    
          expect(res.body.name).to.equal('AuthenticationError');
          expect(res).to.have.status(400);
          expect(res).to.have.property('error');
        });
    });


    it('should reject wrong UNs', function () {
      return chai
        .request(app)
        .post('/api/login')
        .send({ username: 'BLAHBLAHBLEEBLAH', password })
        .then((res) =>{
          expect(res).to.have.status(401);
          expect(res.error).to.not.be.false;
          expect(res.body.message).to.equal('Unauthorized')
          // console.log(res.body);
        }
        );
    });


    it('should reject wrong PWs', function () {
      return chai
        .request(app)
        .post('/api/login')
        .send({ username, password:'BLAHBLAHBLEEBLAH' })
        .then((res) =>{
          expect(res).to.have.status(401);
          expect(res.error).to.not.be.false;
          expect(res.body.message).to.equal('Unauthorized');
          // console.log(res.body);
        }
        );
    });




    it('return a valid JWT with correct credentials', function () {
      return chai
        .request(app)
        .post('/api/login')
        .send({ username, password})
        .then((res) =>{
          expect(res).to.have.status(200);
          expect(res.error).to.be.false;
          expect(res.body).to.have.key('authToken');
          const jwtToken = res.body.authToken;
        }
        );
    });


  });
//==================    
});