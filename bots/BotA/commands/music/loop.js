const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Ativa ou desativa o loop da música atual.'),
    requiredRoles: [], // Nenhuma restrição de cargo
    async execute(interaction) {
        const distube = interaction.client.distube;

        try {
            const queue = distube.getQueue(interaction.guildId);
            if (!queue) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xff0000)
                            .setDescription('❌ Não há nada tocando no momento.'),
                    ],
                });
            }

            const loopMode = queue.repeatMode === 0 ? 1 : 0; // 0 = desativado, 1 = loop da música
            queue.setRepeatMode(loopMode);

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x00ff00)
                        .setDescription(
                            loopMode
                                ? '🔁 Loop ativado para a música atual.'
                                : '🔁 Loop desativado.'
                        ),
                ],
            });
        } catch (error) {
            console.error('Erro ao alternar o loop:', error);
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('❌ Não foi possível alterar o estado do loop.'),
                ],
            });
        }
    },
};