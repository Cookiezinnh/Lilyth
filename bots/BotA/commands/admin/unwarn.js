const { SlashCommandBuilder } = require('discord.js');
const Warn = require('../../models/warns');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unwarn')
        .setDescription('Remove um aviso de um usuário pelo ID.')
        .addStringOption(option =>
            option.setName('alvo')
                .setDescription('Usuário ou ID do aviso a ser removido.')
                .setRequired(true)),
    requiredRoles: [roles.ADMIN, roles.MODERATOR], // Cargos permitidos para usar este comando

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let guild, options;

        // Identifica se é um comando Slash ou prefixado
        if (isInteraction) {
            guild = context.guild;
            options = context.options;
        } else {
            guild = context.guild;
            options = args;
        }

        // Obter o alvo (usuário ou ID do aviso)
        const targetInput = isInteraction
            ? options.getString('alvo')
            : args[0];

        const targetId = targetInput?.replace(/[^0-9]/g, ''); // Extrair números (ID ou menção)
        let targetUser;
        try {
            targetUser = await guild.members.fetch(targetId).catch(() => null);
        } catch (error) {
            console.error('[Unwarn Command] Erro ao buscar usuário:', error);
        }

        if (!targetUser) {
            const errorMessage = ':x: Usuário ou ID inválido.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        const warnId = isInteraction
            ? options.getString('alvo')
            : args[1];

        if (!warnId) {
            const errorMessage = ':x: ID do aviso não fornecido.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        try {
            const warnData = await Warn.findOne({ guildId: guild.id, userId: targetUser.id });

            if (!warnData || !warnData.warns.length) {
                const noWarnsMessage = ':x: Esse usuário não possui avisos.';
                return isInteraction
                    ? context.reply({ content: noWarnsMessage, ephemeral: true })
                    : context.channel.send(noWarnsMessage);
            }

            const warnIndex = warnData.warns.findIndex(warn => warn.id === warnId);
            if (warnIndex === -1) {
                const warnNotFoundMessage = ':x: ID do aviso não encontrado.';
                return isInteraction
                    ? context.reply({ content: warnNotFoundMessage, ephemeral: true })
                    : context.channel.send(warnNotFoundMessage);
            }

            warnData.warns.splice(warnIndex, 1);
            await warnData.save();

            const successMessage = `✅ O aviso com ID \`${warnId}\` foi removido de ${targetUser.user.tag}.`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[Unwarn Command] Erro ao remover aviso:', error);
            const errorMessage = ':x: Ocorreu um erro ao remover o aviso.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};