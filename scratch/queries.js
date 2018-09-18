const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config');

const Note = require('../models/note');

mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
.then(()=>{
    return Note.find();
})
  .then(() => {
    const searchTerm = new RegExp('lady gaga', 'gi');
    let filterTitle = {};
    let filterContent= {};


    if (searchTerm) {
      filterTitle.title = { $regex: searchTerm };
      filterContent.content = { $regex: searchTerm };
    }

    return Note.find({$or: [filterTitle, filterContent]}).sort({ updatedAt: 'desc' });
  })
// .then(()=>{
//     const id = "000000000000000000000005";
//     return Note.findById(id);
// })
// .then(()=>{
//     let newNote = {title: "New Note about dogs", content: "dogs are better than cats"}


//     return Note.create(newNote);
// })
// .then(()=>{
//     const updateId = "000000000000000000000005";
//     const updatedNote = {
//         title: "French Bull Dogs are too cute",
//         content: "They have lots of nasal problems"
//     };
//     return Note.findByIdAndUpdate(updateId, {$set: updatedNote});
// })
// .then(()=>{
//     const deleteId = "5ba154aad75ca91b2888c71a";

//     return Note.findByIdAndRemove(deleteId);
// })
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