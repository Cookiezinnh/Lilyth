const mongoose = require('mongoose');

// Define o esquema do prefixo
const prefixSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    prefix: { type: String, required: true },
    enabled: { type: Boolean, default: true },
});

// Certifica-se de que o modelo não será sobrescrito
if (!mongoose.models.Prefix) {
    mongoose.model('Prefix', prefixSchema);
}

// Exporta o modelo existente ou recém-criado
module.exports = mongoose.model('Prefix');