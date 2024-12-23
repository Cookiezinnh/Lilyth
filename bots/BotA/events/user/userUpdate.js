const { EmbedBuilder } = require('discord.js');
const channels = require('../../../../shared/channels');
const emojis = require('../../../../shared/emojis'); // Integração dos emojis.

module.exports = async (client, oldUser, newUser) => {
  try {
    // Inicializa as mudanças detectadas
    const changes = [];

    if (oldUser.username !== newUser.username) {
      changes.push(`${emojis.update} **Nome:** \`${oldUser.username}\` → \`${newUser.username}\``);
    }

    if (oldUser.discriminator !== newUser.discriminator) {
      changes.push(`${emojis.update} **Discriminator:** \`#${oldUser.discriminator}\` → \`#${newUser.discriminator}\``);
    }

    if (oldUser.avatar !== newUser.avatar) {
      changes.push(`${emojis.avatar} **Avatar:** [Visualizar Avatar Novo](${newUser.displayAvatarURL({ size: 4096 })})`);
    }

    // Se não houver mudanças, interrompe a execução
    if (changes.length === 0) return;

    // Criação do Embed
    const embed = new EmbedBuilder()
      .setTitle(`${emojis.user} Atualização de Perfil`)
      .setDescription(
        `**${emojis.dblurple} __Informações Básicas__**:\n\n` +
        `**${emojis.user} Usuário** | \`${newUser.tag}\`\n` +
        `**${emojis.id} ID** | \`${newUser.id}\`\n\n` +
        `**${emojis.dgreen} __Mudanças Detectadas__**:\n\n` +
        changes.join('\n')
      )
      .setColor('#3498db')
      .setThumbnail(newUser.displayAvatarURL({ size: 4096 }))
      .setTimestamp()
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

    // Busca o canal de log configurado
    const logChannel = await client.channels.fetch(channels.USER_LOG);

    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    } else {
      console.warn('🟥 | [userUpdate] Canal de log não encontrado ou inválido.');
    }
  } catch (error) {
    console.error('⬛ | [userUpdate] Erro ao processar atualização de usuário:', error);
  }
};