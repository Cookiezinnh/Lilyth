const { SlashCommandBuilder } = require('discord.js');
const ReactionRole = require('../../models/reactionRoles.js');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('messagereactionstatus')
        .setDescription('Exibe a lista de mensagens com sistema de reação ativo.'),
    requiredRoles: [roles.ADMIN, roles.MODERATOR], // Cargos permitidos para usar este comando
    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guild = isInteraction ? context.guild : context.guild;

        try {
            const reactions = await ReactionRole.find({ guildId: guild.id });

            if (!reactions.length) {
                const noReactionsMessage = '⚠️ Não há mensagens com sistema de reação configurado neste servidor.';
                if (isInteraction) {
                    return context.reply(noReactionsMessage);
                } else {
                    return context.channel.send(noReactionsMessage);
                }
            }

            const statusList = reactions.map(rr => 
                `**Mensagem:** ${rr.messageId} | **Emoji:** ${rr.emoji} | **Cargo:** <@&${rr.roleId}>`
            ).join('\n');

            const successMessage = `📋 Lista de mensagens com sistema de reação ativo:\n\n${statusList}`;
            if (isInteraction) {
                await context.reply(successMessage);
            } else {
                await context.channel.send(successMessage);
            }
        } catch (error) {
            console.error('[MessageReactionStatus] Erro ao buscar no banco:', error);
            const errorMessage = '❌ Ocorreu um erro ao buscar os sistemas de reação.';
            if (isInteraction) {
                await context.reply(errorMessage);
            } else {
                await context.channel.send(errorMessage);
            }
        }
    },
};