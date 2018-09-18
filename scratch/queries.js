const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
// .then(()=>{
//     return Note.find();
// })
//   .then(() => {
//     const searchTerm = new RegExp('lady gaga', 'gi');
//     let filter = {};

//     if (searchTerm) {
//       filter.title = { $regex: searchTerm };
//     }

//     return Note.find(filter).sort({ updatedAt: 'desc' });
//   })
// .then(()=>{
//     const id = "000000000000000000000005";
//     return Note.findById(id);
// })
.then(()=>{
    let newNote = {title: "New Note about dogs", content: "dogs are better than cats"}


    return Note.create(newNote);
})
  .then(results => {
    console.log(results);
  })
  .then(() => {
    return mongoose.disconnect()
  })
  .catch(err => {
    console.error(`ERROR: ${err.message}`);
    console.error(err);
  });