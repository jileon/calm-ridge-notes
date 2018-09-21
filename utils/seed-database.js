const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tags');

const { notes, folders, tags} = require('../db/seed/data');


//  mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
//   .then(() => mongoose.connection.db.dropDatabase())
//   .then(()=> {
//     Folder.insertMany(folders);
//     Folder.createIndexes();
//   })
//   .then(() => Note.insertMany(notes))
//   .then(results => {
//     console.info(`Inserted ${results.length} Notes`);
//     console.log(results);
//   })
//   .then(() => mongoose.disconnect())
//   .catch(err => {
//     console.error(err);
//   });

mongoose.connect(MONGODB_URI, { useNewUrlParser:true })
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Note.insertMany(notes),
      Folder.insertMany(folders),
      Folder.createIndexes(),
      Tag.insertMany(tags),
      Tag.createIndexes()

    ]);
  })
  .then(results => {
    console.info(`Returned ${results.length} results`);
    console.info(`Inserted ${results[0].length} notes`);
    console.log(results);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });

 