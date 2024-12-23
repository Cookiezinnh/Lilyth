const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responde com Pong!'),
    requiredRoles: [], // Nenhuma restrição de cargo
    async execute(interaction) {
        await interaction.reply('🏓 Pong!');
    },
};