const { SlashCommandBuilder } = require('discord.js');
const Warn = require('../../models/warns');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearwarns')
        .setDescription('Remove todos os avisos de um usuário.')
        .addStringOption(option =>
            option.setName('alvo')
                .setDescription('Usuário ou ID do usuário alvo. (mencione, forneça o ID ou o nome)')
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

        // Obter o alvo pelo ID, menção ou nome
        const targetInput = isInteraction
            ? options.getString('alvo')
            : args[0];

        // Tentar obter o membro
        const targetId = targetInput?.replace(/[^0-9]/g, ''); // Extrair apenas números (caso seja menção)
        const target = targetId
            ? await guild.members.fetch(targetId).catch(() => null)
            : guild.members.cache.find(member =>
                member.user.tag === targetInput || member.user.username === targetInput);

        if (!target) {
            const errorMessage = ':x: Usuário não encontrado.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        try {
            const warnData = await Warn.findOne({ guildId: guild.id, userId: target.id });

            if (!warnData || !warnData.warns.length) {
                const noWarnsMessage = ':x: Esse usuário não possui avisos.';
                return isInteraction
                    ? context.reply({ content: noWarnsMessage, ephemeral: true })
                    : context.channel.send(noWarnsMessage);
            }

            warnData.warns = [];
            await warnData.save();

            const successMessage = `✅ Todos os avisos de ${target.user?.tag || targetId} foram removidos.`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[ClearWarns Command] Erro ao limpar avisos:', error);
            const errorMessage = ':x: Ocorreu um erro ao limpar os avisos.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};
