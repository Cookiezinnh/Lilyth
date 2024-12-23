const mongoose = require('mongoose');

const reactionRoleSchema = new mongoose.Schema({
    messageId: { type: String, required: true },  // ID da mensagem alvo
    emoji: { type: String, required: true },     // Emoji vinculado
    roleId: { type: String, required: true },    // ID do cargo
    guildId: { type: String, required: true },   // ID do servidor
});

module.exports = mongoose.model('ReactionRole', reactionRoleSchema);