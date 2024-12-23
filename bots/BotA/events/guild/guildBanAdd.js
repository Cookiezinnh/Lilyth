const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, ban) => {
    try {
        // Obter informações do banimento
        const user = ban.user;
        const guild = ban.guild;

        // Criar o embed
        const embed = new EmbedBuilder()
            .setTitle(`${emojis.ban} Um Usuário foi Banido!`)
            .setDescription(
                `**${emojis.dblurple} __Informações do Usuário__**:\n\n` +
                `**${emojis.user} Usuário** | ${user.tag} (${user.id})\n` +
                `**${emojis.avatar} Avatar** | [Clique aqui](${user.displayAvatarURL({ dynamic: true, size: 512 })})\n\n` +
                `**${emojis.dgreen} __Informações do Servidor__**:\n\n` +
                `**${emojis.guild} Nome do Servidor** | ${guild.name}\n` +
                `**${emojis.id} ID do Servidor** | ${guild.id}\n`
            )
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setColor('#ff0000')
            .setTimestamp()
            .setFooter({ 
                text: `${client.user.username}`, 
                iconURL: client.user.displayAvatarURL() 
            });

        // Buscar o canal de log configurado
        const logChannel = await client.channels.fetch(channels.PNSH_LOG);

        // Enviar o embed no canal de log, caso exista
        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
        } else {
            console.warn('🟥 | [guildBanAdd] Canal de log não encontrado ou inválido.');
        }
    } catch (error) {
        console.error('⬛ | [guildBanAdd] Erro ao processar banimento de usuário:', error);
    }
};