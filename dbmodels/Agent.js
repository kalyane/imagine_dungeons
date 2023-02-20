const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const agentSchema = new Schema({
   name: String,
   user: {type: ObjectId, ref: 'User'},
   code: { type: String },
   user_object: Object
}, { timestamps: true });

const Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent;