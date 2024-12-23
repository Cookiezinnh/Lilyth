const { DisTube } = require('distube');
const { EmbedBuilder } = require('discord.js');
const { SpotifyPlugin } = require('@distube/spotify');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const emojis = require('../../../../shared/emojis');
const config = require('../../config.json');

module.exports = (client) => {
    client.distube = new DisTube(client, {
        emitNewSongOnly: true,
        nsfw: true,
        plugins: [
            new SpotifyPlugin({
                api: {
                    clientId: config.spotifyclientId,
                    clientSecret: config.spotifyclientSecret,
                },
            }),
            new YtDlpPlugin(),
        ],
    });

    client.distube.on('playSong', (queue, song) => {
        const platformEmoji = song.source === 'spotify' ? emojis.spotify : emojis.youtube;

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(`${platformEmoji} Tocando Agora`)
            .setDescription(`**${song.name}** (${song.formattedDuration})\n┗ \\<${song.url}\\>`)
            .addFields([
                { name: 'Autor', value: song.uploader.name || 'Desconhecido', inline: true },
                { name: 'Visualizações', value: song.views?.toLocaleString() || 'N/A', inline: true },
            ])
            .setThumbnail(song.thumbnail);

        queue.textChannel?.send({ embeds: [embed] });
    });

    client.distube.on('addSong', (queue, song) => {
        const platformEmoji = song.source === 'spotify' ? emojis.spotify : emojis.youtube;

        const embed = new EmbedBuilder()
            .setColor('#0000FF')
            .setTitle(`${platformEmoji} Música Adicionada à Fila`)
            .setDescription(`**${song.name}** (${song.formattedDuration})\n┗ \\<${song.url}\\>`)
            .setThumbnail(song.thumbnail);

        queue.textChannel?.send({ embeds: [embed] });
    });

    client.distube.on('error', (channel, error) => {
        const errorChannel = channel?.send ? channel : client.channels.cache.get('ID_DO_CANAL_PADRAO');

        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Ocorreu um Erro')
            .setDescription(error.message || 'Erro desconhecido.');

        errorChannel?.send?.({ embeds: [embed] }).catch(err => console.error('Falha ao enviar mensagem de erro:', err));
    });

    console.log('🟩 | [MusicHandler] DisTube configurado com sucesso!');
};