const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, sticker) => {
  try {
    // Criar o embed
    const embed = new EmbedBuilder()
      .setTitle(`${emojis.sticker} Novo Sticker Criado!`)
      .setDescription(
        `**${emojis.dblurple} __Informações do Sticker__**:\n\n` +
        `**${emojis.sticker} Nome:** | ${sticker.name}\n` +
        `**${emojis.id} ID do Sticker:** | ${sticker.id}\n` +
        `**${emojis.format} Formato:** | ${sticker.formatType}\n` +
        `**${emojis.time} Criado em:** | <t:${parseInt(sticker.createdAt / 1000)}:R>\n`
      )
      .setColor('#00ff00')
      .setTimestamp()
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

    // Buscar o canal de log configurado
    const logChannel = await client.channels.fetch(channels.SERVER_LOG);

    // Enviar o embed no canal de log, caso exista
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    } else {
      console.warn('🟥 | [stickerCreate] Canal de log não encontrado ou inválido.');
    }
  } catch (error) {
    console.error('⬛ | [stickerCreate] Erro ao processar criação do sticker:', error);
  }
};
