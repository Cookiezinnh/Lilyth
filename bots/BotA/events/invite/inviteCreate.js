const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, invite) => {
    try {
        // Criar o embed
        const embed = new EmbedBuilder()
            .setTitle(`${emojis.invite} Um novo convite foi criado!`)
            .setDescription(
                `**${emojis.dblurple} __Informações do Convite__**:\n\n` +
                `**${emojis.link} URL** | ${invite.url}\n` +
                `**${emojis.id} ID** | ${invite.code}\n\n` +
                `**${emojis.dgreen} __Detalhes Adicionais__**:`
            )
            .addFields(
                {
                    name: `${emojis.channel} | Canal`,
                    value: `<#${invite.channel.id}> | ${invite.channel.name}`,
                    inline: false
                },
                {
                    name: `${emojis.user} | Criado por`,
                    value: `${invite.inviter.tag} [ID: ${invite.inviter.id}]`,
                    inline: false
                },
                {
                    name: `${emojis.clock} | Data de Expiração`,
                    value: invite.expiresAt
                        ? `<t:${parseInt(invite.expiresAt / 1000)}:R>`
                        : 'Sem Expiração',
                    inline: false
                }
            )
            .setColor('#2ECC71')
            .setTimestamp()
            .setFooter({
                text: client.user.username,
                iconURL: client.user.displayAvatarURL()
            });

        // Buscar o canal de log configurado
        const logChannel = await client.channels.fetch(channels.SERVER_LOG);

        // Enviar o embed no canal de log, caso exista
        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
        } else {
            console.warn('🟥 | [inviteCreate] Canal de log não encontrado ou inválido.');
        }
    } catch (error) {
        console.error('⬛ | [inviteCreate] Erro ao processar criação de convite:', error);
    }
};