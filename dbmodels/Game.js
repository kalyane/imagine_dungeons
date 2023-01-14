const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const gameSchema = new Schema({
   name: String,
   user: {type: ObjectId, ref: 'User'},
   size_x: Number,
   size_z: Number 
}, { timestamps: true });

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;