const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const assetSchema = new Schema({
   type: String,
   name: String
});

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;