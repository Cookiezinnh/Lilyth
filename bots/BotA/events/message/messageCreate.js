const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, message) => {
  try {
    if (message.author.bot) return;

    // Formatar informações do autor e do canal
    const authorInfo = `${message.author.tag} (${message.author.id})`;
    const channelMention = message.channel ? `<#${message.channel.id}>` : 'Desconhecido';
    const messageContent = message.content || 'Sem texto';

    // Criar o embed
    const embed = new EmbedBuilder()
      .setTitle(`${emojis.message} Uma Nova Mensagem foi Criada!`)
      .setDescription(
        `**${emojis.dblurple} __Informações Básicas__**:\n\n` +
        `**${emojis.user} Autor:** | ${authorInfo}\n` +
        `**${emojis.channel} Canal:** | ${channelMention}\n` +
        `**${emojis.id} ID da Mensagem:** | ${message.id}\n\n` +
        `**${emojis.dgreen} __Conteúdo da Mensagem__**:`
      )
      .addFields({
        name: `${emojis.menu} | Conteúdo`,
        value: `${messageContent}`,
        inline: false,
      })
      .setColor('#00ff00')
      .setTimestamp()
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

    // Buscar o canal de log configurado
    const logChannel = await client.channels.fetch(channels.MSG_LOG);

    // Enviar o embed no canal de log, caso exista
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    } else {
      console.warn('🟥 | [messageCreate] Canal de log não encontrado ou inválido.');
    }
  } catch (error) {
    console.error('⬛ | [messageCreate] Erro ao processar criação de mensagem:', error);
  }
};