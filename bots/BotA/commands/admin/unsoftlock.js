const { SlashCommandBuilder } = require('discord.js');
const SoftLock = require('../../models/softlock');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unsoftlock')
        .setDescription('Remove o softlock de um usuário.')
        .addStringOption(option =>
            option.setName('usuario')
                .setDescription('Usuário ou ID do usuário a ser desbloqueado.')
                .setRequired(true)),
    requiredRoles: [roles.ADMIN, roles.MODERATOR],

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let targetInput, guild;

        if (isInteraction) {
            targetInput = context.options.getString('usuario');
            guild = context.guild;
        } else {
            targetInput = args[0];
            guild = context.guild;
        }

        // Obter o cargo "Softlock"
        const softlockRole = guild.roles.cache.get(roles.SOFTLOCKED_ROLE);
        if (!softlockRole) {
            const errorMessage = ':x: O cargo "Softlock" não foi encontrado.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        // Tentar obter o membro pelo ID, menção ou nome
        const targetId = targetInput?.replace(/[^0-9]/g, ''); // Extrair apenas números (caso seja menção)
        const member = targetId
            ? await guild.members.fetch(targetId).catch(() => null)
            : guild.members.cache.find(m =>
                m.user.tag === targetInput || m.user.username === targetInput);

        if (!member) {
            const errorMessage = ':x: Usuário não encontrado.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        try {
            // Remove o cargo de softlock
            await member.roles.remove(softlockRole);

            // Remove o usuário do banco de dados
            await SoftLock.findOneAndDelete({ guildId: guild.id, userId: member.id });

            const successMessage = `✅ Usuário ${member.user.tag || targetId} foi desbloqueado.`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: false })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[UnSoftLock Command] Erro ao desbloquear o usuário:', error);
            const errorMessage = ':x: Ocorreu um erro ao tentar desbloquear o usuário.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};