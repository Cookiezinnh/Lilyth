const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, role) => {
    try {
        const embed = new EmbedBuilder()
            .setTitle(`${emojis.createrole} Um Novo Cargo foi Criado!`)
            .setDescription(
                `**${emojis.dblurple} __Informações Básicas__**:\n\n` +
                `**${emojis.role} Cargo** | ${role.name}\n` +
                `**${emojis.id} ID** | ${role.id}\n\n` +
                `**${emojis.dgreen} __Detalhes do Cargo__**:`
            )
            .addFields(
                {
                    name: `${emojis.palette} | Cor`,
                    value: `${role.color === 0 ? 'Padrão' : `#${role.color.toString(16).toUpperCase()}`}`,
                    inline: false
                },
                {
                    name: `${emojis.checkmark} | Menções`,
                    value: `${role.mentionable ? emojis.checkmark : emojis.x}`,
                    inline: true
                },
                {
                    name: `${emojis.pin} | Hoisted`,
                    value: `${role.hoist ? emojis.checkmark : emojis.x}`,
                    inline: true
                }
            )
            .setColor('#2ecc71')
            .setTimestamp()
            .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

        const logChannel = await client.channels.fetch(channels.SERVER_LOG);

        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
        } else {
            console.warn('🟥 | [roleCreate] Canal de log não encontrado ou inválido.');
        }
    } catch (error) {
        console.error('⬛ | [roleCreate] Erro ao processar criação de cargo:', error);
    }
};