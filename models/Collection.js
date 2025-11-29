const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    fields: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Collection', CollectionSchema);
