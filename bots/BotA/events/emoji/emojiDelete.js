const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, emoji) => {
  try {
    // Definir informações básicas
    const emojiType = emoji.animated ? 'Animado' : 'Estático';
    const emojiURL = emoji.url || 'Sem URL';

    // Criar embed
    const embed = new EmbedBuilder()
      .setTitle(`${emojis.deleteemoji} O Emoji foi Deletado!`)
      .setDescription(
        `**${emojis.dblurple} __Informações Básicas__**:\n\n` +
        `**${emojis.name} Nome** | ${emoji.name || 'Desconhecido'}\n` +
        `**${emojis.id} ID** | \`${emoji.id}\`\n` +
        `**${emojis.link} URL** | [Clique aqui](${emojiURL})\n\n` +
        `<@&1310266977717321908>\n\n` +
        `**${emojis.dgreen} __Informações Sobre o Emoji__**:`
      )
      .addFields(
        {
          name: `${emojis.menu} | Tipo`,
          value: `${emojiType}`,
          inline: false
        }
      )
      .setColor('#E74C3C')
      .setThumbnail(emojiURL)
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    // Buscar o canal de log configurado
    const logChannel = await client.channels.fetch(channels.SERVER_LOG);

    // Enviar o embed no canal de log, caso exista
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    } else {
      console.warn('🟥 | [emojiDelete] Canal de log não encontrado ou inválido.');
    }
  } catch (error) {
    console.error('⬛ | [emojiDelete] Erro ao processar exclusão de emoji:', error);
  }
};
