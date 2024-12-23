const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, channel) => {
    try {
        // Mapear emojis de criação com base no tipo do canal
        const typeEmojis = {
            0: emojis.createchannel, // Texto
            2: emojis.createstage, // Voz
            4: emojis.createsticker, // Categoria
            5: emojis.createevent, // Anúncios
            13: emojis.createstage // Stage
        };

        // Obter o emoji baseado no tipo do canal ou um padrão
        const typeEmoji = typeEmojis[channel.type] || emojis.createchannel;
        const channelType = {
            0: 'Canal de Texto',
            2: 'Canal de Voz',
            4: 'Categoria',
            5: 'Canal de Anúncios',
            13: 'Stage'
        }[channel.type] || 'Desconhecido';

        // Formatar a menção do canal
        const channelMention = channel.id ? `<#${channel.id}>` : 'Desconhecido';

        // Formatar o nome do canal sem o prefixo '#'
        const formattedName = channel.name ? `${channel.name.replace(/^#/, '')}` : 'Desconhecido';

        // Criar o embed
        const embed = new EmbedBuilder()
            .setTitle(`${emojis.dwhite} Um novo ${channelType} foi Criado.`)
            .setDescription(
                `**${emojis.dblurple} __Informações Básicas__**:\n\n` +
                `**${emojis.channel} Nome** | ${channelMention} [ ${formattedName} ]\n` +
                `**${emojis.id} ID** | ${channel.id}\n\n` +
                `**${emojis.dgreen} __Detalhes do Canal__**:`
            )
            .addFields(
                { name: `${emojis.menu} | Tipo`,
                  value: `${typeEmoji} | ${channelType}`,
                  inline: false },
                {
                    name: `${emojis.folder} | Categoria`,
                    value: `${emojis.uparrow} | ${channel.parent?.name || 'Sem Categoria'}`,
                    inline: false
                },
                {
                    name: `${emojis.calendar} | Data de Criação`,
                    value: `${emojis.clock} | <t:${Math.floor(channel.createdAt / 1000)}:R>`,
                    inline: false
                },
                {
                    name: `${emojis.adultcontent} | NSFW`,
                    value: channel.nsfw ? `${emojis.checkmark} | O Canal é NSFW` : `${emojis.x} | O Canal não é NSFW`,
                    inline: false
                }
            )
            .setColor('#00ff00')
            .setTimestamp()
            .setFooter({
                text: `${client.user.username}`,
                iconURL: client.user.displayAvatarURL({ size: 4096 })
            });

        // Buscar o canal de log configurado
        const logChannel = await client.channels.fetch(channels.SERVER_LOG);

        // Enviar o embed no canal de log, caso exista
        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
        } else {
            console.warn('🟥 | [channelCreate] Canal de log não encontrado ou inválido.');
        }
    } catch (error) {
        console.error('⬛ | [channelCreate] Erro ao processar criação de canal:', error);
    }
};