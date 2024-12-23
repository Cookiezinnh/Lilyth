const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, emoji) => {
  try {
    // Criar o embed
    const embed = new EmbedBuilder()
      .setTitle(`${emojis.createemoji} Um Novo Emoji Foi Criado!`)
      .setDescription(
        `**${emojis.dblurple} __Informações Básicas__**:\n\n` +
        `**${emojis.channel} Nome** | ${emoji} [ **${emoji.name}** ]\n` +
        `**${emojis.id} ID** | \`${emoji.id}\`\n\n` +
        `<@&1310266977717321908>\n\n` +
        `**${emojis.dgreen} __Detalhes do Emoji__**:`
      )
      .addFields(
        { 
          name: `${emojis.menu} | Animado`, 
          value: `${emoji.animated ? 'Sim' : 'Não'}`, 
          inline: false 
        },
        { 
          name: `${emojis.calendar} | Criado em`, 
          value: `<t:${Math.floor(emoji.createdAt / 1000)}:R>`, 
          inline: false 
        }
      )
      .setColor('#2ECC71')
      .setThumbnail(emoji.url)
      .setTimestamp()
      .setFooter({ 
        text: client.user.username, 
        iconURL: client.user.displayAvatarURL() 
      });

    // Buscar o canal de log configurado
    const logChannel = await client.channels.fetch(channels.SERVER_LOG);

    // Enviar o embed no canal de log, caso exista
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    } else {
      console.warn('🟥 | [emojiCreate] Canal de log não encontrado ou inválido.');
    }
  } catch (error) {
    console.error('⬛ | [emojiCreate] Erro ao processar criação de emoji:', error);
  }
};