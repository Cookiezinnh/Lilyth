const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, sticker) => {
  try {
    // Criar o embed
    const embed = new EmbedBuilder()
      .setTitle(`${emojis.sticker} Sticker Deletado!`)
      .setDescription(
        `**${emojis.dblurple} __Informações do Sticker__**:\n\n` +
        `**${emojis.sticker} Nome:** | ${sticker.name}\n` +
        `**${emojis.id} ID do Sticker:** | ${sticker.id}\n` +
        `**${emojis.format} Formato:** | ${sticker.formatType}\n` +
        `**${emojis.clock} Deletado em:** | <t:${parseInt(sticker.deletedAt / 1000)}:R>\n`
      )
      .setColor('#ff0000')
      .setTimestamp()
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

    // Buscar o canal de log configurado
    const logChannel = await client.channels.fetch(channels.SERVER_LOG);

    // Enviar o embed no canal de log, caso exista
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    } else {
      console.warn('🟥 | [stickerDelete] Canal de log não encontrado ou inválido.');
    }
  } catch (error) {
    console.error('⬛ | [stickerDelete] Erro ao processar deleção do sticker:', error);
  }
};