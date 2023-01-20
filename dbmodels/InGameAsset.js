const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const inGameAssetSchema = new Schema({
   name: String,
   asset: {type: ObjectId, ref: 'Asset'},
   game: {type: ObjectId, ref: 'Game'},
   position_x: Number,
   position_z: Number,
   quaternion_y: Number,
   quaternion_w: Number,
   life: { type: Number, default: 0 },
   strength: { type: Number, default: 0 }
});

const InGameAsset = mongoose.model('InGameAsset', inGameAssetSchema);

module.exports = InGameAsset;