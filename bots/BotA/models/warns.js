const mongoose = require('mongoose');

const warnSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    warns: [
        {
            id: { type: String, required: true }, // ID único do warn
            reason: { type: String, required: true },
            moderator: { type: String, required: true }, // Quem aplicou o warn
            date: { type: Date, default: Date.now },
        },
    ],
});

module.exports = mongoose.model('Warn', warnSchema);
