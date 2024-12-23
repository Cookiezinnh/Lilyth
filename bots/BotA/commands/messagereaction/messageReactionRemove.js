const { SlashCommandBuilder } = require('discord.js');
const ReactionRole = require('../../models/reactionRoles.js');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('messagereactionremove')
        .setDescription('Remove um sistema de reação para cargos.')
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('ID da mensagem alvo.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji a ser removido.')
                .setRequired(true)),
    requiredRoles: [roles.ADMIN, roles.MODERATOR], // Cargos permitidos para usar este comando
    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guild = isInteraction ? context.guild : context.guild;
        const messageId = isInteraction ? context.options.getString('messageid') : args[0];
        const emoji = isInteraction ? context.options.getString('emoji') : args[1];

        try {
            console.log(`[ReactionRemove] Removendo sistema: mensagem ${messageId}, emoji ${emoji}`);

            const result = await ReactionRole.findOneAndDelete({ messageId, emoji, guildId: guild.id });

            if (!result) {
                console.warn('[ReactionRemove] Nenhuma configuração encontrada.');
                const noReactionMessage = '⚠️ Nenhum sistema de reação encontrado para os parâmetros informados.';
                if (isInteraction) {
                    return context.reply(noReactionMessage);
                } else {
                    return context.channel.send(noReactionMessage);
                }
            }

            console.log(`[ReactionRemove] Sistema de reação removido: ${JSON.stringify(result)}`);
            const successMessage = `✅ Sistema de reação removido para a mensagem ${messageId} e emoji ${emoji}.`;
            if (isInteraction) {
                await context.reply(successMessage);
            } else {
                await context.channel.send(successMessage);
            }
        } catch (error) {
            console.error('[ReactionRemove] Erro ao remover sistema:', error);
            const errorMessage = '❌ Ocorreu um erro ao remover o sistema de reação.';
            if (isInteraction) {
                await context.reply(errorMessage);
            } else {
                await context.channel.send(errorMessage);
            }
        }
    },
};