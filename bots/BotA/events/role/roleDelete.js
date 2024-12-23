const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, role) => {
    try {
        // Criar o embed com estética semelhante ao channelDelete
        const embed = new EmbedBuilder()
            .setTitle(`${emojis.deleterole} O cargo foi Deletado!`)
            .setDescription(
                `**${emojis.dblurple} __Informações Básicas__**:\n\n` +
                `**${emojis.role} Nome** | ${role.name || 'Desconhecido'}\n` +
                `**${emojis.id} ID** | ${role.id}\n\n` +
                `**${emojis.dgreen} __Informações Sobre o Cargo__**:\n`
            )
            .addFields(
                {
                    name: `${emojis.color} | Cor`,
                    value: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : 'Padrão',
                    inline: true
                },
                {
                    name: `${emojis.permissions} | Permissões`,
                    value: role.permissions.bitfield ? role.permissions.bitfield.toString() : 'Nenhuma',
                    inline: true
                },
                {
                    name: `${emojis.members} | Número de Membros`,
                    value: `${role.members.size} membros`,
                    inline: true
                }
            )
            .setColor('#e74c3c')
            .setTimestamp()
            .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

        // Buscar o canal de log configurado
        const logChannel = await client.channels.fetch(channels.SERVER_LOG);

        // Enviar o embed no canal de log, caso exista
        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
        } else {
            console.warn('🟥 | [roleDelete] Canal de log não encontrado ou inválido.');
        }
    } catch (error) {
        console.error('⬛ | [roleDelete] Erro ao processar deleção de cargo:', error);
    }
};