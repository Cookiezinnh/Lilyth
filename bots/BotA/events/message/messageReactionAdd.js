const ReactionRole = require('../../models/reactionRoles.js');
const { EmbedBuilder } = require('discord.js');
const channels = require('../../../../shared/channels');
const emojis = require('../../../../shared/emojis');

module.exports = async (client, reaction, user) => {
  if (user.bot) return;

  try {
    const reactionRole = await ReactionRole.findOne({
      messageId: reaction.message.id,
      emoji: reaction.emoji.name,
    });

    if (!reactionRole) return;

    const guild = reaction.message.guild;
    const member = guild.members.cache.get(user.id);
    const roleId = reactionRole.roleId.replace(/[<@&>]/g, ''); // Limpa o ID
    const role = guild.roles.cache.get(roleId);

    if (!role) {
      console.error(`🟥 | [ReactionAdd] Cargo com ID "${reactionRole.roleId}" não encontrado no servidor "${guild.name}".`);

      const embed = new EmbedBuilder()
        .setTitle(`${emojis.x} Erro ao Atribuir Cargo`)
        .setDescription(
          `**${emojis.dblurple} __Informações Básicas__**\n\n` +
          `**${emojis.server} Servidor:** ${guild.name}\n` +
          `**${emojis.id} ID do Servidor:** ${guild.id}\n\n` +
          `**${emojis.role} Cargo não encontrado:**\n` +
          `ID: ${reactionRole.roleId}`
        )
        .setColor('Red')
        .setTimestamp()
        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

      const logChannel = await client.channels.fetch(channels.ERROR_CHANNEL);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
      return;
    }

    await member.roles.add(role);

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.checkmark} Cargo Atribuído com Sucesso!`)
      .setDescription(
        `**${emojis.dblurple} __Informações do Cargo__**\n\n` +
        `**${emojis.user} Usuário:** <@${user.id}>\n` +
        `**${emojis.id} ID do Usuário:** ${user.id}\n` +
        `**${emojis.role} Cargo Atribuído:** ${role.name}\n` +
        `**${emojis.emoji} Emoji Usado:** ${reaction.emoji.name}\n\n` +
        `**${emojis.link} Mensagem:** [Clique aqui](${reaction.message.url})`
      )
      .setColor('Green')
      .setTimestamp()
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

    const logChannel = await client.channels.fetch(channels.SERVER_LOG);
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }

    console.log(`🟩 | [ReactionAdd] Cargo "${role.name}" atribuído a ${user.tag}.`);
  } catch (error) {
    console.error('⬛ | [ReactionAdd] Erro ao atribuir cargo:', error);

    const embed = new EmbedBuilder()
      .setTitle(`${emojis.x} Erro ao Atribuir Cargo`)
      .setDescription(
        `**${emojis.dblurple} __Informações Básicas__**\n\n` +
        `**${emojis.user} Usuário:** <@${user.id}>\n` +
        `**${emojis.id} ID do Usuário:** ${user.id}\n\n` +
        `**${emojis.error} Erro:**\n\`${error.message}\``
      )
      .setColor('Red')
      .setTimestamp()
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

    const logChannel = await client.channels.fetch(channels.MSG_LOG);
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }
  }
};