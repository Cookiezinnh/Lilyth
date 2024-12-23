const { SlashCommandBuilder } = require('discord.js');
const roles = require('../../../../shared/roles.js');
const categories = require('../../../../shared/categories');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('softlocksetup')
        .setDescription('Configura permissões de softlock para todos os canais do servidor, exceto os da categoria SoftLock.'),
    requiredRoles: [roles.ADMIN],

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guild = context.guild;

        if (isInteraction) {
            await context.deferReply({ ephemeral: true });
        }

        const softlockRole = guild.roles.cache.get(roles.SOFTLOCKED_ROLE);
        if (!softlockRole) {
            const replyMessage = ':x: O cargo "Softlock" não foi encontrado.';
            return isInteraction
                ? context.editReply(replyMessage)
                : context.channel.send(replyMessage);
        }

        try {
            const channels = guild.channels.cache.filter(
                channel => channel.parentId !== categories.SOFTLOCK_CATEGORY && channel.type !== 4 // Exclui categorias e verifica parentId
            );

            for (const channel of channels.values()) {
                await channel.permissionOverwrites.edit(softlockRole, {
                    ViewChannel: false,
                    SendMessages: false,
                    Connect: false,
                    ReadMessageHistory: false,
                });
            }

            const successMessage = '✅ Permissões de softlock configuradas para todos os canais do servidor (exceto os da categoria SoftLock).';
            return isInteraction
                ? context.editReply(successMessage)
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[SoftLockSetup Command] Erro ao configurar permissões:', error);
            const errorMessage = ':x: Ocorreu um erro ao configurar permissões de softlock.';
            return isInteraction
                ? context.editReply(errorMessage)
                : context.channel.send(errorMessage);
        }
    },
};