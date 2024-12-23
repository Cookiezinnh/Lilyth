const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, message) => {
  try {
    if (message.partial) await message.fetch(); // Garantir que a mensagem seja completamente carregada
    if (message.author.bot) return; // Ignorar mensagens de bots

    // Obter informações básicas
    const messageContent = message.content || 'Sem texto';
    const channelMention = message.channel ? `<#${message.channel.id}>` : 'Desconhecido';
    const formattedChannelName = message.channel.name || 'Desconhecido';

    // Criar embed com estrutura consistente
    const embed = new EmbedBuilder()
      .setTitle(`${emojis.trash} Mensagem Deletada!`)
      .setDescription(
        `**${emojis.dblurple} __Informações Básicas__**:\n\n` +
        `**${emojis.user} Autor** | ${message.author.tag} (${message.author.id})\n` +
        `**${emojis.channel} Canal** | ${channelMention} [ ${formattedChannelName} ]\n` +
        `**${emojis.id} ID da Mensagem** | ${message.id}\n\n` +
        `**${emojis.dgreen} __Conteúdo__**:\n\n${messageContent}`
      )
      .addFields(
        {
          name: `${emojis.menu} | Informações Adicionais`,
          value: `Mensagem deletada em ${new Date().toLocaleString()}`
        }
      )
      .setColor('#ff0000')
      .setTimestamp()
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

    // Enviar embed para o canal de logs configurado
    const logChannel = await client.channels.fetch(channels.MSG_LOG);
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    } else {
      console.warn('🟥 | [messageDelete] Canal de log não encontrado ou inválido.');
    }
  } catch (error) {
    console.error('⬛ | [messageDelete] Erro ao processar exclusão de mensagem:', error);
  }
};