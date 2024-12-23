const { EmbedBuilder } = require('discord.js');
const SoftLock = require('../../models/softlock');
const Mute = require('../../models/mute');
const roles = require('../../../../shared/roles');
const emojis = require('../../../../shared/emojis');

module.exports = async (client, member) => {
  const newMemberRoleId = roles.NEW_MEMBER_ROLE;
  const softlockRoleId = roles.SOFTLOCKED_ROLE;
  const muteRoleId = roles.MUTED_ROLE;

  try {
    const actions = [];

    // Atribuir o cargo de Novo Membro
    const newMemberRole = member.guild.roles.cache.get(newMemberRoleId);
    if (newMemberRole) {
      await member.roles.add(newMemberRole);
      actions.push(`${emojis.check} **Cargo Adicionado**: ${newMemberRole.name}`);
    }

    // Verificar e aplicar SoftLock
    const isSoftLocked = await SoftLock.findOne({ guildId: member.guild.id, userId: member.id });
    const softlockRole = member.guild.roles.cache.get(softlockRoleId);
    if (isSoftLocked && softlockRole) {
      await member.roles.add(softlockRole);
      actions.push(`${emojis.lock} **SoftLock Aplicado**: ${softlockRole.name}`);
    }

    // Verificar e aplicar Mute
    const muteData = await Mute.findOne({ guildId: member.guild.id, userId: member.id });
    const muteRole = member.guild.roles.cache.get(muteRoleId);
    if (muteData && muteRole) {
      await member.roles.add(muteRole);
      actions.push(`${emojis.mute} **Mute Reaplicado**: ${muteRole.name}`);
      const remainingTime = muteData.unmuteAt.getTime() - Date.now();
      if (remainingTime > 0) {
        setTimeout(async () => {
          try {
            const updatedMuteData = await Mute.findOneAndDelete({ guildId: member.guild.id, userId: member.id });
            if (updatedMuteData) {
              const updatedMember = member.guild.members.cache.get(member.id);
              if (updatedMember) {
                await updatedMember.roles.remove(muteRole);
                console.log(`[guildMemberAdd] Mute removido automaticamente de ${member.user.tag}.`);
              }
            }
          } catch (error) {
            console.error(`[guildMemberAdd] Erro ao remover mute automaticamente:`, error);
          }
        }, remainingTime);
      } else {
        await Mute.findOneAndDelete({ guildId: member.guild.id, userId: member.id });
      }
    }

    // Criar o embed
    const embed = new EmbedBuilder()
      .setTitle(`${emojis.welcome} Novo Membro Entrou!`)
      .setDescription(
        `**${emojis.user} Usuário**: ${member.user.tag} (${member.user.id})\n` +
        `**${emojis.guild} Servidor**: ${member.guild.name}\n\n` +
        `**${emojis.check} __Ações Executadas__**:`
      )
      .addFields(
        { name: `${emojis.actions} | Detalhes`, value: actions.length > 0 ? actions.join('\n') : 'Nenhuma ação adicional aplicada.' }
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setColor('#00ffaa')
      .setTimestamp()
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

    // Enviar o embed no canal de log
    const logChannel = await client.channels.fetch(roles.JOIN_LOG);
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error(`[guildMemberAdd] Erro ao gerenciar entrada de ${member.user.tag}:`, error);
  }
};