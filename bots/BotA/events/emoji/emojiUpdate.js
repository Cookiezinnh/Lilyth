const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, oldEmoji, newEmoji) => {
  try {
    const changes = [];

    // Detectar alterações no nome do emoji
    if (oldEmoji.name !== newEmoji.name) {
      changes.push({
        name: `${emojis.name} | Alteração no Nome`,
        value: `**De:** \`${oldEmoji.name}\` **Para:** \`${newEmoji.name}\``,
        inline: false
      });
    }

    // Detectar alterações na disponibilidade animada
    if (oldEmoji.animated !== newEmoji.animated) {
      const oldAnimated = oldEmoji.animated ? 'Animado' : 'Estático';
      const newAnimated = newEmoji.animated ? 'Animado' : 'Estático';
      changes.push({
        name: `${emojis.animation} | Tipo de Emoji`,
        value: `**De:** ${oldAnimated} **Para:** ${newAnimated}`,
        inline: false
      });
    }

    // Verificar alterações nas permissões de função para o emoji
    const oldRoles = oldEmoji.roles.cache.map(role => role.name).join(', ') || 'Nenhum';
    const newRoles = newEmoji.roles.cache.map(role => role.name).join(', ') || 'Nenhum';
    if (oldRoles !== newRoles) {
      changes.push({
        name: `${emojis.roles} | Permissões de Funções`,
        value: `**De:** ${oldRoles}
**Para:** ${newRoles}`,
        inline: false
      });
    }

    // Se não houver alterações, retornar
    if (changes.length === 0) return;

    // Dividir mudanças em múltiplos embeds se necessário
    const embeds = [];
    for (let i = 0; i < changes.length; i += 25) {
      const slicedChanges = changes.slice(i, i + 25);
      embeds.push(new EmbedBuilder()
        .setTitle(`${emojis.updateemoji} O Emoji foi Atualizado!`)
        .setDescription(
          `**${emojis.dblurple} __Informações Básicas__**:\n\n` +
          `**${emojis.emoji} Emoji** | ${newEmoji}
` +
          `**${emojis.id} ID** | \`${newEmoji.id}\`\n\n` +
          `**${emojis.dgreen} __Alterações Realizadas__**:`
        )
        .addFields(slicedChanges)
        .setThumbnail(newEmoji.url)
        .setColor('#F1C40F')
        .setTimestamp()
        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() }));
    }

    // Buscar o canal de log configurado
    const logChannel = await client.channels.fetch(channels.SERVER_LOG);

    // Enviar os embeds no canal de log, caso exista
    if (logChannel) {
      for (const embed of embeds) {
        await logChannel.send({ embeds: [embed] });
      }
    } else {
      console.warn('🟥 | [emojiUpdate] Canal de log não encontrado ou inválido.');
    }
  } catch (error) {
    console.error('⬛ | [emojiUpdate] Erro ao processar atualização de emoji:', error);
  }
};