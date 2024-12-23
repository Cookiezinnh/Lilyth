const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const roles = require('../../../../shared/roles.js');
const { searchYouTube, cacheSearch, getCachedSearch } = require('../../utils/musicSearchCache');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Toca uma música em um canal de voz.')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription('O nome ou URL da música para tocar.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('source')
                .setDescription('A plataforma para buscar a música (youtube ou spotify).')
                .addChoices(
                    { name: 'YouTube', value: 'youtube' },
                    { name: 'Spotify', value: 'spotify' }
                )
        ),
    requiredRoles: [],
    async execute(interaction) {
        const { client, guild, member } = interaction;

        const distube = client.distube;
        if (!distube) {
            return interaction.reply({
                content: 'O sistema de música não está configurado corretamente.',
                ephemeral: true,
            });
        }

        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({
                content: 'Você precisa estar em um canal de voz para usar este comando!',
                ephemeral: true,
            });
        }

        if (!voiceChannel.joinable) {
            return interaction.reply({
                content: 'Eu não consigo entrar no canal de voz. Verifique minhas permissões!',
                ephemeral: true,
            });
        }

        const query = interaction.options.getString('query');
        const source = interaction.options.getString('source'); // 'youtube' ou 'spotify'

        try {
            await interaction.deferReply();

            let videoUrl;

            if (query.startsWith('https://open.spotify.com/')) {
                // Spotify URL detectada
                if (source && source !== 'spotify') {
                    return interaction.editReply({
                        content: 'O toggle de plataforma está configurado para YouTube, mas o link é do Spotify.',
                        ephemeral: true,
                    });
                }
                videoUrl = query; // Spotify URLs são suportadas nativamente pelo DisTube
            } else if (query.startsWith('https://www.youtube.com/') || query.startsWith('https://youtu.be/')) {
                // YouTube URL detectada
                if (source && source !== 'youtube') {
                    return interaction.editReply({
                        content: 'O toggle de plataforma está configurado para Spotify, mas o link é do YouTube.',
                        ephemeral: true,
                    });
                }
                videoUrl = query;
            } else {
                // Pesquisa por nome
                if (source === 'spotify') {
                    // Deixa o DisTube resolver a busca no Spotify
                    videoUrl = query;
                } else {
                    // Busca no YouTube usando o sistema de cache
                    videoUrl = await getCachedSearch(query);
                    if (!videoUrl) {
                        videoUrl = await searchYouTube(query);
                        await cacheSearch(query, videoUrl);
                    }
                }
            }

            const options = {
                member,
                textChannel: interaction.channel,
            };

            await distube.play(voiceChannel, videoUrl, options);

            await interaction.editReply({
                content: `🎶 Música adicionada à fila ou tocando agora: ${videoUrl}`,
            });
        } catch (error) {
            console.error('Erro ao tocar música:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('❌ Erro ao Tocar Música')
                .setDescription(`**Motivo:** ${error.message || 'Desconhecido.'}`);

            if (interaction.replied || interaction.deferred) {
                interaction.editReply({ embeds: [errorEmbed] });
            } else {
                interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};