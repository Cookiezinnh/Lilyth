const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, ban) => {
  try {
    const user = ban.user;
    const guild = ban.guild;

    // Criar o embed com informações detalhadas
    const embed = new EmbedBuilder()
      .setTitle(`${emojis.unban} Usuário Desbanido!`)
      .setDescription(
        `**${emojis.dblurple} __Informações Básicas__**:\n\n` +
        `**${emojis.user} Usuário** | ${user.tag} (${user.id})\n` +
        `**${emojis.guild} Servidor** | ${guild.name}\n\n` +
        `**${emojis.dgreen} __Informações Complementares__**:\n\n` +
        `**${emojis.calendar} Data do Desban** | <t:${Math.floor(Date.now() / 1000)}:F>`
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
      .addFields(
        { 
          name: `${emojis.id} | ID do Usuário`, 
          value: `\`${user.id}\``, 
          inline: true 
        },
        {
          name: `${emojis.server} | Nome do Servidor`,
          value: `${guild.name}`,
          inline: true
        }
      )
      .setColor('#00ff00')
      .setTimestamp()
      .setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL() });

    // Buscar o canal de log configurado
    const logChannel = await client.channels.fetch(channels.PNSH_LOG);

    // Enviar o embed no canal de log, caso exista
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    } else {
      console.warn('🟥 | [guildBanRemove] Canal de log não encontrado ou inválido.');
    }
  } catch (error) {
    console.error('⬛ | [guildBanRemove] Erro ao processar remoção de banimento:', error);
  }
};