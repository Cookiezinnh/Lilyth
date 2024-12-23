const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, member) => {
  try {
    // Criar o embed com mais detalhes e organização
    const embed = new EmbedBuilder()
      .setTitle(`${emojis.leave} Membro Saiu do Servidor`)
      .setDescription(
        `**${emojis.dblurple} __Informações Básicas__**:\n\n` +
        `**${emojis.user} Usuário** | ${member.user.tag}\n` +
        `**${emojis.id} ID** | ${member.user.id}\n\n` +
        `**${emojis.guild} __Informações Sobre o Servidor__**:`
      )
      .addFields(
        {
          name: `${emojis.guild} | Nome do Servidor`,
          value: `${member.guild.name}`,
          inline: false
        },
        {
          name: `${emojis.member} | Total de Membros`,
          value: `${member.guild.memberCount}`,
          inline: false
        }
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setColor('#ffaa00')
      .setTimestamp()
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

    // Buscar o canal de log configurado
    const logChannel = await client.channels.fetch(channels.JOIN_LOG);

    // Enviar o embed no canal de log, caso exista
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    } else {
      console.warn('🟥 | [guildMemberRemove] Canal de log não encontrado ou inválido.');
    }
  } catch (error) {
    console.error('⬛ | [guildMemberRemove] Erro ao processar saída de membro:', error);
  }
};