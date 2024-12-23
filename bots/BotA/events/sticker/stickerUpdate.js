const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, oldSticker, newSticker) => {
  try {
    const changes = [];

    // Verifica se houve alteração no nome
    if (oldSticker.name !== newSticker.name) {
      changes.push({
        name: 'Alteração no Nome do Sticker',
        value: `**De:** ${oldSticker.name} **Para:** ${newSticker.name}`
      });
    }

    // Verifica se houve alteração no formato
    if (oldSticker.formatType !== newSticker.formatType) {
      changes.push({
        name: 'Alteração no Formato do Sticker',
        value: `**De:** ${oldSticker.formatType} **Para:** ${newSticker.formatType}`
      });
    }

    if (changes.length === 0) return;

    // Criar o embed
    const embed = new EmbedBuilder()
      .setTitle(`${emojis.updateemoji} Sticker Atualizado!`)
      .setDescription(
        `**${emojis.dblurple} __Informações do Sticker__**:\n\n` +
        `**${emojis.sticker} Sticker Nome:** | ${newSticker.name}\n` +
        `**${emojis.id} ID do Sticker:** | ${newSticker.id}\n\n` +
        `**${emojis.dgreen} __Alterações__**:`
      )
      .addFields(changes)
      .setColor('#ffaa00')
      .setTimestamp()
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

    // Buscar o canal de log configurado
    const logChannel = await client.channels.fetch(channels.SERVER_LOG);

    // Enviar o embed no canal de log, caso exista
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    } else {
      console.warn('🟥 | [stickerUpdate] Canal de log não encontrado ou inválido.');
    }
  } catch (error) {
    console.error('⬛ | [stickerUpdate] Erro ao processar atualização do sticker:', error);
  }
};