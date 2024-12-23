const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, invite) => {
    try {
        // Criar o embed com estrutura estética similar ao `channelDelete`
        const embed = new EmbedBuilder()
            .setTitle(`${emojis.delete} Convite Removido!`)
            .setDescription(
                `**${emojis.dblurple} __Informações Básicas__**:\n\n` +
                `**${emojis.link} URL** | ${invite.url || 'Desconhecido'}\n` +
                `**${emojis.id} Código** | ${invite.code}\n\n` +
                `**${emojis.dgreen} __Informações Sobre o Convite__**:`
            )
            .addFields(
                { 
                    name: `${emojis.channel} | Canal`, 
                    value: `<#${invite.channel.id}>` || `Desconhecido`, 
                    inline: false 
                },
                { 
                    name: `${emojis.user} | Criado por`, 
                    value: invite.inviter?.tag || `Desconhecido`, 
                    inline: false 
                }
            )
            .setColor('#E74C3C')
            .setTimestamp()
            .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

        // Buscar o canal de log configurado
        const logChannel = await client.channels.fetch(channels.SERVER_LOG);

        // Enviar o embed no canal de log, caso exista
        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
        } else {
            console.warn('🟥 | [inviteDelete] Canal de log não encontrado ou inválido.');
        }
    } catch (error) {
        console.error('⬛ | [inviteDelete] Erro ao processar remoção de convite:', error);
    }
};