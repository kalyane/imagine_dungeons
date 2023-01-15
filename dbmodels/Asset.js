const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assetSchema = new Schema({
   name: String,
   type: String
});

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;