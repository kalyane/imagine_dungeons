const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const assetSchema = new Schema({
   unique_name: String,
   asset_name: String,
   type: String,
   game: {type: ObjectId, ref: 'Game'},
   position_x: Number,
   position_z: Number,
   quaternion_y: Number,
   quaternion_w: Number,
   life: { type: Number, default: 0 },
   strength: { type: Number, default: 0 }
});

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;