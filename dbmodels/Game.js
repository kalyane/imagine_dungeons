const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const gameSchema = new Schema({
   name: String,
   user: {type: ObjectId, ref: 'User'},
   size_x: {type: Number, default: 50},
   size_z: {type: Number, default: 50},
   near: {type: Number, default: 10},
   far: {type: Number, default: 50} 
}, { timestamps: true });

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;