const { EmbedBuilder } = require('discord.js');
const channels = require('../../../../shared/channels');
const emojis = require('../../../../shared/emojis');

module.exports = async (client, oldMember, newMember) => {
  try {
    const changes = [];

    // Mudança de apelido
    if (oldMember.nickname !== newMember.nickname) {
      changes.push(
        `**${emojis.rename} Mudança de Apelido:**\n` +
        `**De:** ${oldMember.nickname || 'Nenhum'} **Para:** ${newMember.nickname || 'Nenhum'}`
      );
    }

    // Mudança de cargos
    const oldRoles = oldMember.roles.cache.map(role => role.name);
    const newRoles = newMember.roles.cache.map(role => role.name);

    if (oldRoles.length !== newRoles.length) {
      const addedRoles = newRoles.filter(role => !oldRoles.includes(role));
      const removedRoles = oldRoles.filter(role => !newRoles.includes(role));

      if (addedRoles.length > 0) {
        changes.push(
          `**${emojis.add} Cargos Adicionados:**\n` +
          `${addedRoles.map(role => `\`${role}\``).join(', ')}`
        );
      }

      if (removedRoles.length > 0) {
        changes.push(
          `**${emojis.remove} Cargos Removidos:**\n` +
          `${removedRoles.map(role => `\`${role}\``).join(', ')}`
        );
      }
    }

    if (changes.length === 0) return; // Não envia o embed se nenhuma mudança for detectada.

    // Criar embed
    const embed = new EmbedBuilder()
      .setTitle(`${emojis.member} Atualização de Membro!`)
      .setDescription(
        `**${emojis.dblurple} __Informações do Membro__**\n\n` +
        `**${emojis.user} Membro:** ${newMember.user.tag} (${newMember.user})\n` +
        `**${emojis.id} ID:** \`${newMember.id}\`\n\n` +
        `**${emojis.dgreen} __Alterações Detectadas__**:`
      )
      .addFields(
        changes.map(change => ({
          name: `${emojis.bullet} Alteração`,
          value: change,
          inline: false
        }))
      )
      .setThumbnail(newMember.user.displayAvatarURL({ size: 4096 }))
      .setColor('#f1c40f')
      .setFooter({
        text: client.user.username,
        iconURL: client.user.displayAvatarURL({ size: 4096 })
      })
      .setTimestamp();

    // Buscar o canal de log configurado
    const logChannel = await client.channels.fetch(channels.USER_LOG);
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    } else {
      console.warn('🟥 | [guildMemberUpdate] Canal de log não encontrado ou inválido.');
    }
  } catch (error) {
    console.error('⬛ | [guildMemberUpdate] Erro ao processar atualização de membro:', error);
  }
};