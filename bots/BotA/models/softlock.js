const mongoose = require('mongoose');

const softlockSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
});

module.exports = mongoose.model('SoftLock', softlockSchema);