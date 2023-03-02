const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const agentSchema = new Schema({
   name: String,
   user: {type: ObjectId, ref: 'User'},
   code: { type: String },
   user_object: { type: Object, default: {} }
}, { timestamps: true, minimize: false });

const Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent;