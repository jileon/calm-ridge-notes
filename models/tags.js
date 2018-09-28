const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {type: String, required:true },
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},

});

tagSchema.index({ name:1, userId: 1}, { unique: true });
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