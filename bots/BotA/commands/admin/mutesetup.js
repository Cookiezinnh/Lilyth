const { SlashCommandBuilder } = require('discord.js');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mutesetup')
        .setDescription('Configura permissões de mute para todos os canais do servidor.'),
    requiredRoles: [roles.ADMIN, roles.MODERATOR], // Cargos permitidos para usar este comando

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guild = isInteraction ? context.guild : context.guild;
        const member = isInteraction ? context.member : context.member || context.author;

        // Verifica se o usuário possui os cargos necessários
        const memberRoles = member.roles.cache;
        const hasPermission = this.requiredRoles.some(role => memberRoles.has(role));
        if (!hasPermission) {
            const replyMessage = ':x: Você não tem permissão para usar este comando.';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        const muteRole = guild.roles.cache.get(roles.MUTED_ROLE);
        if (!muteRole) {
            const replyMessage = ':x: O cargo "Mute" não foi encontrado.';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        try {
            if (isInteraction) {
                await context.deferReply({ ephemeral: true });
            }

            const channels = guild.channels.cache;
            for (const channel of channels.values()) {
                await channel.permissionOverwrites.edit(muteRole, {
                    SendMessages: false,
                    Speak: false,
                });
            }

            const successMessage = '✅ Permissões de mute configuradas para todos os canais do servidor.';
            return isInteraction
                ? context.editReply(successMessage)
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[MuteSetup Command] Erro ao configurar permissões:', error);
            const errorMessage = ':x: Ocorreu um erro ao configurar permissões de mute.';
            return isInteraction
                ? context.editReply(errorMessage)
                : context.channel.send(errorMessage);
        }
    },
};