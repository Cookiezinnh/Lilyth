const ReactionRole = require('../../models/reactionRoles.js');
const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, reaction, user) => {
    if (user.bot) return;

    const emoji = reaction.emoji.id || reaction.emoji.name;

    try {
        const reactionRole = await ReactionRole.findOne({
            messageId: reaction.message.id,
            emoji,
        });

        if (!reactionRole) return;

        const guild = reaction.message.guild;
        const member = await guild.members.fetch(user.id);
        const role = guild.roles.cache.get(reactionRole.roleId);

        if (role) {
            await member.roles.remove(role);

            console.log(`[ReactionRemove] Cargo "${role.name}" removido de ${user.tag}.`);

            // Criar o embed com estilo refinado
            const embed = new EmbedBuilder()
                .setTitle(`${emojis.dwhite} Remoção de Cargo por Reação`)
                .setDescription(
                    `**${emojis.dblurple} __Informações Básicas__**:\n\n` +
                    `**${emojis.member} Usuário** | ${user.tag} [${user.id}]\n` +
                    `**${emojis.emoji} Emoji** | ${emoji}\n\n` +
                    `**${emojis.dgreen} __Informações do Cargo__**:\n\n` +
                    `**${emojis.role} Cargo Removido** | ${role.name}\n` +
                    `**${emojis.link} Mensagem** | [Ir para a mensagem](${reaction.message.url})`
                )
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setColor('#ff0000')
                .setFooter({
                    text: `ID do Servidor: ${guild.id}`,
                    iconURL: guild.iconURL({ dynamic: true }),
                })
                .setTimestamp();

            // Envia o log para o canal designado
            const logChannel = await client.channels.fetch(channels.MSG_LOG);
            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            } else {
                console.warn('🟥 | Canal de log para remoção de reação não encontrado.');
            }
        }
    } catch (error) {
        console.error('[ReactionRemove] Erro ao remover cargo:', error);
    }
};