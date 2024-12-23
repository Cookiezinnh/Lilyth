const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

const pendingUpdates = new Map(); // Armazena temporariamente as mudanças

module.exports = async (client, oldChannel, newChannel) => {
    try {
        const channelId = newChannel.id;

        // Mapeamento de Emojis para tipos de canais
        const typeEmojis = {
            0: emojis.updatechannel, // Texto
            2: emojis.updatestage, // Voz
            4: emojis.updatesticker, // Categoria
            5: emojis.updateevent, // Anúncios
            13: emojis.updatestage // Stage
        };

        const typeEmoji = typeEmojis[newChannel.type] || emojis.updatechannel;
        const channelType = {
            0: 'Canal de Texto',
            2: 'Canal de Voz',
            4: 'Categoria',
            5: 'Canal de Anúncios',
            13: 'Stage'
        }[newChannel.type] || 'Desconhecido';

        // Função para processar as permissões alteradas
        const getPermissionChanges = () => {
            const changes = [];
            const permissionList = Object.keys(PermissionsBitField.Flags);

            const oldPermissions = oldChannel.permissionOverwrites.cache;
            const newPermissions = newChannel.permissionOverwrites.cache;
            const allPermissionIds = new Set([...oldPermissions.keys(), ...newPermissions.keys()]);

            allPermissionIds.forEach((id) => {
                const oldPerm = oldPermissions.get(id);
                const newPerm = newPermissions.get(id);
                const changesForThisPerm = [];

                permissionList.forEach((perm) => {
                    const oldState = oldPerm?.allow.has(PermissionsBitField.Flags[perm])
                        ? `${emojis.checkmark} Permitida`
                        : oldPerm?.deny.has(PermissionsBitField.Flags[perm])
                        ? `${emojis.x} Negada`
                        : `${emojis.splash} Neutralizada`;

                    const newState = newPerm?.allow.has(PermissionsBitField.Flags[perm])
                        ? `${emojis.checkmark} Permitida`
                        : newPerm?.deny.has(PermissionsBitField.Flags[perm])
                        ? `${emojis.x} Negada`
                        : `${emojis.splash} Neutralizada`;

                    if (oldState !== newState) {
                        changesForThisPerm.push(`\`${perm}\`: **De** ${oldState} **Para** ${newState}`);
                    }
                });

                if (changesForThisPerm.length > 0) {
                    const role = newChannel.guild.roles.cache.get(id);
                    const roleName = role ? role.name : `Cargo não encontrado (ID: ${id})`;

                    changes.push({
                        name: `${emojis.dyellow} Alterações nas Permissões para ${roleName}`,
                        value: changesForThisPerm.join('\n'),
                        inline: false
                    });
                }
            });
            return changes;
        };

        // Função para obter alterações básicas no canal
        const getBasicChanges = () => {
            const changes = [];

            if (oldChannel.name !== newChannel.name) {
                changes.push({
                    name: `${emojis.channel} | Alteração no Nome`,
                    value: `**De:** ${oldChannel.name} **Para:** ${newChannel.name}`,
                    inline: false
                });
            }

            if (oldChannel.topic !== newChannel.topic) {
                const oldTopic = oldChannel.topic !== undefined ? oldChannel.topic : 'Nenhum';
                const newTopic = newChannel.topic !== undefined ? newChannel.topic : 'Nenhum';
                if (oldTopic !== newTopic) {
                    changes.push({
                        name: `${emojis.folder} | Alteração no Tópico`,
                        value: `**De:** ${oldTopic} **Para:** ${newTopic}`,
                        inline: false
                    });
                }
            }

            if (oldChannel.parentId !== newChannel.parentId) {
                const oldCategory = oldChannel.parent?.name || 'Sem Categoria';
                const newCategory = newChannel.parent?.name || 'Sem Categoria';
                changes.push({
                    name: `${emojis.folder} | Alteração na Categoria`,
                    value: `**De:** ${oldCategory} **Para:** ${newCategory}`,
                    inline: false
                });
            }

            if ('nsfw' in oldChannel && oldChannel.nsfw !== newChannel.nsfw) {
                const oldNsfw = oldChannel.nsfw ? `${emojis.checkmark} Sim` : `${emojis.x} Não`;
                const newNsfw = newChannel.nsfw ? `${emojis.checkmark} Sim` : `${emojis.x} Não`;
                changes.push({
                    name: `${emojis.adultcontent} | NSFW`,
                    value: `**De:** ${oldNsfw} **Para:** ${newNsfw}`,
                    inline: false
                });
            }

            if ('rateLimitPerUser' in oldChannel && oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
                changes.push({
                    name: `${emojis.clock} | Alteração no Slowmode`,
                    value: `**De:** ${oldChannel.rateLimitPerUser || 0} segundos **Para:** ${newChannel.rateLimitPerUser || 0} segundos`,
                    inline: false
                });
            }

            return changes;
        };

        // Obtém todas as mudanças
        const basicChanges = getBasicChanges();
        const permissionChanges = getPermissionChanges();
        const allChanges = [...basicChanges, ...permissionChanges];

        if (allChanges.length === 0) return;

        // Se já houver um update pendente, adiciona as mudanças
        if (pendingUpdates.has(channelId)) {
            pendingUpdates.get(channelId).fields.push(...allChanges);
        } else {
            // Cria um novo objeto de atualização pendente
            pendingUpdates.set(channelId, {
                channel: newChannel,
                fields: allChanges
            });

            // Envia o embed após um pequeno intervalo (5 segundos)
            setTimeout(async () => {
                const update = pendingUpdates.get(channelId);
                if (!update) return;

                const embed = new EmbedBuilder()
                    .setTitle(`${typeEmoji} O ${channelType} foi Atualizado.`)
                    .setDescription(`**${emojis.channel} Nome** | <#${update.channel.id}>`)
                    .setColor('#ffaa00')
                    .setTimestamp()
                    .addFields(update.fields)
                    .setFooter({
                        text: `${client.user.username}`,
                        iconURL: client.user.displayAvatarURL({ size: 4096 })
                    });

                const logChannel = await client.channels.fetch(channels.SERVER_LOG);
                if (logChannel) {
                    await logChannel.send({ embeds: [embed] });
                }

                pendingUpdates.delete(channelId); // Limpa o cache
            }, 5000); // Tempo de espera antes de enviar
        }
    } catch (error) {
        console.error('Erro ao processar atualização de canal:', error);
    }
};