const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  title: {type: String, required: true, unique: true}

});

folderSchema.set('timestamps', true);

folderSchema.set('toObject', {
  virtual: true,
  transform: function(doc,ret){
    delete ret._id;
    delete ret.__v;
  }
});

const folderModel = mongoose.model('Folder', folderSchema);
module.exports = folderModel;