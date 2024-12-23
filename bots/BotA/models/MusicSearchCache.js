const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
    query: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SearchCache', searchSchema);