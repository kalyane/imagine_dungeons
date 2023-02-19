const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const agentSchema = new Schema({
   name: String,
   user: {type: ObjectId, ref: 'User'},
   code: { type: String },
   versionHistory: [{
      json: Object,
      episodes: Number,
      rewards: [Number],
      createdAt: { type: Date, default: Date.now }
   }]
}, { timestamps: true });

agentSchema.pre('save', function (next) {
   if (this.versionHistory.length >= 5) {
      this.versionHistory.shift();
   }
   next();
});

const Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent;