const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis.js');
const channels = require('../../../../shared/channels.js');
const PrivateVC = require('../../models/privateVoiceChannel.js');
const Categories = require('../../../../shared/categories.js');

module.exports = async (client, oldState, newState) => {
    try {
        const logChannel = await client.channels.fetch(channels.CALL_LOG);

        const generateEmbed = (color, title, description, fields = []) => {
            return new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .addFields(fields)
                .setColor(color)
                .setTimestamp()
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });
        };

        // Entrou em um canal de voz
        if (!oldState.channelId && newState.channelId) {
            const embed = generateEmbed(
                '#00ff00',
                `${emojis.join} Usuário entrou no Canal`,
                `**${emojis.user} Usuário** | <@${newState.member.user.id}>\n**${emojis.channel} Canal** | <#${newState.channelId}>`,
                [
                    { name: `${emojis.id} | ID do Usuário`, value: `${newState.member.user.id}`, inline: false },
                    { name: `${emojis.voice} | Canal`, value: `<#${newState.channelId}>`, inline: true },
                ]
            );
            if (logChannel) await logChannel.send({ embeds: [embed] });
        }

        // Saiu de um canal de voz
        if (oldState.channelId && !newState.channelId) {
            const embed = generateEmbed(
                '#ff0000',
                `${emojis.leave} Usuário saiu do Canal`,
                `**${emojis.user} Usuário** | <@${oldState.member.user.id}>\n**${emojis.channel} Canal** | <#${oldState.channelId}>`,
                [
                    { name: `${emojis.id} | ID do Usuário`, value: `${oldState.member.user.id}`, inline: true },
                    { name: `${emojis.voice} | Canal`, value: `<#${oldState.channelId}>`, inline: true },
                ]
            );
            if (logChannel) await logChannel.send({ embeds: [embed] });
        }

        // Mutou ou desmutou a si mesmo
        if (oldState.selfMute !== newState.selfMute) {
            const action = newState.selfMute ? 'mutou' : 'desmutou';
            const embed = generateEmbed(
                '#ffcc00',
                `${emojis.mute} Usuário ${action}`,
                `**${emojis.user} Usuário** | <@${newState.member.user.id}>\n**${emojis.channel} Canal** | ${newState.channelId ? `<#${newState.channelId}>` : 'Nenhum'}`,
                [
                    { name: `${emojis.id} | ID do Usuário`, value: `${newState.member.user.id}`, inline: true },
                    { name: `${emojis.mic} | Ação`, value: `${action.charAt(0).toUpperCase() + action.slice(1)}`, inline: true },
                ]
            );
            if (logChannel) await logChannel.send({ embeds: [embed] });
        }

        // "Deafou" ou "Undeafou"
        if (oldState.selfDeaf !== newState.selfDeaf) {
            const action = newState.selfDeaf ? 'deafou' : 'undeafou';
            const embed = generateEmbed(
                '#6699ff',
                `${emojis.deaf} Usuário ${action}`,
                `**${emojis.user} Usuário** | <@${newState.member.user.id}>\n**${emojis.channel} Canal** | ${newState.channelId ? `<#${newState.channelId}>` : 'Nenhum'}`,
                [
                    { name: `${emojis.id} | ID do Usuário`, value: `${newState.member.user.id}`, inline: false },
                    { name: `${emojis.headphones} | Ação`, value: `${action.charAt(0).toUpperCase() + action.slice(1)}`, inline: false },
                ]
            );
            if (logChannel) await logChannel.send({ embeds: [embed] });
        }

        // Gerenciamento de canais privados
        if (newState.channelId) {
            const privateVC = await PrivateVC.findOne({ voiceChannelId: newState.channelId });

            if (privateVC) {
                try {
                    const permissions = newState.channel
                        ? newState.channel.permissionOverwrites.cache.map(overwrite => overwrite)
                        : [];
                    
                    // Criar canal privado
                    const clone = await newState.guild.channels.create({
                        name: privateVC.name,
                        type: 2,
                        parent: Categories.CLONED_VC_CATEGORY,
                        permissionOverwrites: permissions,
                    });

                    // Mover o usuário para o novo canal
                    await newState.member.voice.setChannel(clone);

                    // Log de criação do canal
                    const embed = generateEmbed(
                        '#00ff00',
                        `${emojis.create} Canal de Voz Privado Criado`,
                        `**${emojis.user} Usuário** | <@${newState.member.user.id}>`,
                        [
                            { name: `${emojis.channel} | Nome do Canal`, value: clone.name, inline: false },
                            { name: `${emojis.folder} | Categoria`, value: `<#${clone.parentId}>`, inline: false },
                            { name: `${emojis.id} | ID do Canal`, value: clone.id, inline: false },
                        ]
                    );
                    if (logChannel) await logChannel.send({ embeds: [embed] });

                    // Verificar se o canal está vazio e deletá-lo
                    const interval = setInterval(async () => {
                        if (clone.members.size === 0) {
                            clearInterval(interval);

                            if (newState.guild.channels.cache.has(clone.id)) {
                                await clone.delete();

                                const deleteEmbed = generateEmbed(
                                    '#ff0000',
                                    `${emojis.delete} Canal de Voz Privado Deletado`,
                                    `**${emojis.channel} Nome** | ${clone.name}`,
                                    [
                                        { name: `${emojis.id} | ID`, value: clone.id, inline: false },
                                        { name: `${emojis.trash} | Motivo`, value: 'Inatividade', inline: false },
                                    ]
                                );
                                if (logChannel) await logChannel.send({ embeds: [deleteEmbed] });
                            }
                        }
                    }, 5000);
                } catch (error) {
                    console.error('[VoiceStateUpdate] Erro ao gerenciar canal privado:', error);
                }
            }
        }
    } catch (error) {
        console.error('[VoiceStateUpdate] Erro geral:', error);
    }
};