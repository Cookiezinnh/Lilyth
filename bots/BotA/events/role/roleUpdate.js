const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, oldRole, newRole) => {
    try {
        const changes = [];

        // Verifica e registra alterações no nome
        if (oldRole.name !== newRole.name) {
            changes.push({
                name: `${emojis.edit} | Alteração no Nome`,
                value: `**De:** ${oldRole.name}\n**Para:** ${newRole.name}`,
                inline: false
            });
        }

        // Verifica e registra alterações na cor
        if (oldRole.color !== newRole.color) {
            changes.push({
                name: `${emojis.palette} | Alteração na Cor`,
                value: `**De:** \`${oldRole.color || 'Padrão'}\`\n**Para:** \`${newRole.color || 'Padrão'}\``,
                inline: false
            });
        }

        // Verifica e registra alterações na permissão de menção
        if (oldRole.mentionable !== newRole.mentionable) {
            const oldMentionable = oldRole.mentionable ? `${emojis.checkmark} Sim` : `${emojis.x} Não`;
            const newMentionable = newRole.mentionable ? `${emojis.checkmark} Sim` : `${emojis.x} Não`;
            changes.push({
                name: `${emojis.mention} | Alteração na Menção`,
                value: `**De:** ${oldMentionable}\n**Para:** ${newMentionable}`,
                inline: false
            });
        }

        // Verifica e registra alterações no destaque (hoist)
        if (oldRole.hoist !== newRole.hoist) {
            const oldHoist = oldRole.hoist ? `${emojis.checkmark} Sim` : `${emojis.x} Não`;
            const newHoist = newRole.hoist ? `${emojis.checkmark} Sim` : `${emojis.x} Não`;
            changes.push({
                name: `${emojis.pin} | Alteração no Destaque`,
                value: `**De:** ${oldHoist}\n**Para:** ${newHoist}`,
                inline: false
            });
        }

        // Verifica mudanças detalhadas nas permissões
        const oldPermissions = oldRole.permissions.toArray();
        const newPermissions = newRole.permissions.toArray();

        const addedPermissions = newPermissions.filter(p => !oldPermissions.includes(p));
        const removedPermissions = oldPermissions.filter(p => !newPermissions.includes(p));

        if (addedPermissions.length > 0) {
            changes.push({
                name: `${emojis.checkmark} | Permissões Adicionadas`,
                value: addedPermissions.map(p => `\`${p}\``).join(', '),
                inline: false
            });
        }

        if (removedPermissions.length > 0) {
            changes.push({
                name: `${emojis.x} | Permissões Removidas`,
                value: removedPermissions.map(p => `\`${p}\``).join(', '),
                inline: false
            });
        }

        // Não envia embed se não houver alterações
        if (changes.length === 0) return;

        // Cria o embed para log de alterações
        const embed = new EmbedBuilder()
            .setTitle(`${emojis.updaterole} Cargo Atualizado`)
            .setDescription(
                `**${emojis.role} __Informações do Cargo__**:` +
                `**${emojis.role} Nome:** ${newRole} [ ${newRole.name} ]` +
                `**${emojis.id} ID:** ${newRole.id}` +
                `**${emojis.dblurple} __Alterações Realizadas__**:`
            )
            .addFields(changes)
            .setColor(newRole.color || '#f1c40f')
            .setTimestamp()
            .setFooter({
                text: `${client.user.username}`,
                iconURL: client.user.displayAvatarURL({ size: 4096 })
            });

        // Envia o embed no canal de logs configurado
        const logChannel = await client.channels.fetch(channels.SERVER_LOG);

        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
        } else {
            console.warn('🟥 | [roleUpdate] Canal de log não encontrado ou inválido.');
        }
    } catch (error) {
        console.error('⬛ | [roleUpdate] Erro ao processar atualização de cargo:', error);
    }
};