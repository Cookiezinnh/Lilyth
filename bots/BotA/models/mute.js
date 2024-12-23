const mongoose = require('mongoose');

const muteSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    muteRoleId: { type: String, required: true },
    unmuteAt: { type: Date, required: true }, // Hora para desmutar
});

module.exports = mongoose.model('Mute', muteSchema);