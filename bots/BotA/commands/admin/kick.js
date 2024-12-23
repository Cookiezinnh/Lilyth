const { SlashCommandBuilder } = require('discord.js');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa um usuário do servidor.')
        .addStringOption(option =>
            option.setName('alvo')
                .setDescription('Usuário ou ID do usuário a ser expulso. (mencione, forneça o ID ou o nome)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo para expulsar o usuário.')
                .setRequired(false)),
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

        const reason = isInteraction
            ? options.getString('motivo') || 'Motivo não especificado'
            : args.slice(1).join(' ') || 'Motivo não especificado';

        // Tentar obter o membro
        const targetId = targetInput?.replace(/[^0-9]/g, ''); // Extrair apenas números (caso seja menção)
        const targetMember = targetId
            ? await guild.members.fetch(targetId).catch(() => null)
            : guild.members.cache.find(member =>
                member.user.tag === targetInput || member.user.username === targetInput);

        if (!targetMember) {
            const errorMessage = ':x: Usuário não encontrado.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        try {
            await targetMember.kick(reason);
            const successMessage = `✅ Usuário ${targetMember.user?.tag || targetId} foi expulso do servidor. Motivo: ${reason}`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[Kick Command] Erro ao expulsar o usuário:', error);
            const errorMessage = ':x: Ocorreu um erro ao tentar expulsar o usuário.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};