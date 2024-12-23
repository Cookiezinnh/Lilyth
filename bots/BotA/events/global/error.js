const { EmbedBuilder } = require('discord.js');
const channels = require('../../../../shared/channels');
const emojis = require('../../../../shared/emojis');

module.exports = async (client, error) => {
    try {
        console.error(`${emojis.x} | [Event] Erro capturado:`, error);

        const errorChannel = await client.channels.fetch(channels.ERROR_CHANNEL);
        if (!errorChannel) {
            console.warn(`${emojis.warning} | [Event] Canal de log de erros não encontrado ou inválido.`);
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(`${emojis.x} Erro Capturado`)
            .setDescription(`Um erro foi capturado pela aplicação.`)
            .setColor('#E74C3C')
            .addFields(
                { name: 'Detalhes do Erro', value: `\`\`\`${error.stack || error.message || error}\`\`\`` }
            )
            .setTimestamp()
            .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

        await errorChannel.send({ embeds: [embed] });
    } catch (err) {
        console.error(`${emojis.x} | [Event] Falha ao registrar erro no canal de log:`, err);
    }
};