const mongoose = require('mongoose');

const privateVCSchema = new mongoose.Schema({
    ownerId: { type: String, required: true },
    guildId: { type: String, required: true },
    voiceChannelId: { type: String, required: true },
    name: { type: String, required: true },
});

module.exports = mongoose.model('PrivateVC', privateVCSchema);