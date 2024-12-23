const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, oldMessage, newMessage) => {
  try {
    // Garantir que as mensagens estão completas
    if (oldMessage.partial) await oldMessage.fetch();
    if (newMessage.partial) await newMessage.fetch();

    // Ignorar mensagens de bots ou mensagens sem alterações no conteúdo
    if (oldMessage.author.bot || newMessage.author.bot || oldMessage.content === newMessage.content) return;

    // Formatar o nome do canal
    const channelMention = `<#${newMessage.channel.id}>`;

    // Criar o embed
    const embed = new EmbedBuilder()
      .setTitle(`${emojis.edit} Mensagem Editada`)
      .setDescription(
        `**${emojis.dblurple} __Informações Básicas__**:\n\n` +
        `**${emojis.user} Autor:** ${newMessage.author.tag} (${newMessage.author.id})\n` +
        `**${emojis.channel} Canal:** ${channelMention}\n` +
        `**${emojis.id} ID da Mensagem:** ${newMessage.id}\n\n` +
        `**${emojis.dgreen} __Conteúdo Alterado__**:`
      )
      .addFields(
        {
          name: `${emojis.menu} Antes`,
          value: oldMessage.content || 'Sem texto',
          inline: false
        },
        {
          name: `${emojis.menu} Depois`,
          value: newMessage.content || 'Sem texto',
          inline: false
        }
      )
      .setColor('#ffaa00')
      .setTimestamp()
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

    // Obter o canal de log
    const logChannel = await client.channels.fetch(channels.MSG_LOG);

    // Enviar o embed no canal de log
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    } else {
      console.warn('🟥 | [messageUpdate] Canal de log não encontrado ou inválido.');
    }
  } catch (error) {
    console.error('⬛ | [messageUpdate] Erro ao processar edição de mensagem:', error);
  }
};