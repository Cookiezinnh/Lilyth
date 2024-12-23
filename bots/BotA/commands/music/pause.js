const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pausa a música que está tocando.'),
    requiredRoles: [], // Nenhuma restrição de cargo
    async execute(interaction) {
        const distube = interaction.client.distube;

        try {
            const queue = distube.getQueue(interaction.guildId);
            if (!queue) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF0000')
                            .setDescription('❌ Não há nada tocando no momento.'),
                    ],
                    ephemeral: true,
                });
            }

            queue.pause();

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription('⏸️ Música pausada com sucesso.');

            interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao pausar música:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Erro ao Pausar Música')
                .setDescription(`**Motivo:** ${error.message || 'Desconhecido.'}`);

            interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    },
};