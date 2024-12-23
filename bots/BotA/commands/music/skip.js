const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription(
            'Pula a música atual. Caso haja 3 ou mais pessoas na call, inicia uma votação.'
        ),
    requiredRoles: [], // Nenhuma restrição de cargo
    async execute(interaction) {
        const distube = interaction.client.distube;
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription(
                            '❌ Você precisa estar em um canal de voz para usar este comando.'
                        ),
                ],
                ephemeral: true,
            });
        }

        const membersInChannel = voiceChannel.members.filter((m) => !m.user.bot).size;

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

            if (membersInChannel < 3) {
                queue.skip();
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x00ff00)
                            .setDescription('⏭️ Música pulada.'),
                    ],
                });
            }

            // Inicia votação
            const message = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xffff00)
                        .setDescription(
                            '🗳️ Votação iniciada para pular a música. Reaja com ✅ para votar.'
                        ),
                ],
                fetchReply: true,
            });

            await message.react('✅');
            const filter = (reaction, user) =>
                reaction.emoji.name === '✅' && !user.bot;

            const collector = message.createReactionCollector({
                filter,
                time: 15000, // 15 segundos para votar
            });

            const voters = new Set();

            collector.on('collect', (reaction, user) => {
                voters.add(user.id);

                const requiredVotes = Math.ceil(membersInChannel / 2);

                if (voters.size >= requiredVotes) {
                    queue.skip();
                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0x00ff00)
                                .setDescription('⏭️ A votação foi aprovada. Música pulada.'),
                        ],
                    });
                    collector.stop();
                }
            });

            collector.on('end', () => {
                if (voters.size < Math.ceil(membersInChannel / 2)) {
                    interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0xff0000)
                                .setDescription(
                                    '❌ A votação foi encerrada. Não houve votos suficientes para pular a música.'
                                ),
                        ],
                    });
                }
            });
        } catch (error) {
            console.error('Erro ao pular a música:', error);
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('❌ Não foi possível pular a música.'),
                ],
            });
        }
    },
};