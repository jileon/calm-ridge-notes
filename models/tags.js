const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {type: String, required:true , unique: true}
});

tagSchema.set('timestamps', true);

tagSchema.set('toObject', {
  virtuals: true,
  transform: function(doc,ret){
    delete ret._id;
    delete ret.__v;
  }
});

const tagModel = mongoose.model('Tag', tagSchema);
module.exports = tagModel;