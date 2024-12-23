const { SlashCommandBuilder } = require('discord.js');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Desbane um usuário do servidor.')
        .addStringOption(option =>
            option.setName('usuario')
                .setDescription('ID ou tag do usuário a ser desbanido (ex: cookiezinnh#9319 ou 462031073891581962)')
                .setRequired(true)),
    requiredRoles: [roles.ADMIN, roles.MODERATOR],

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let input, guild;

        if (isInteraction) {
            input = context.options.getString('usuario');
            guild = context.guild;
        } else {
            input = args[0];
            guild = context.guild;
        }

        let userId;

        try {
            // Determinar o formato do input
            if (/^\d+$/.test(input)) {
                userId = input; // Apenas ID numérico
            } else if (/^.+#\d{4}$/.test(input)) {
                // Tag de usuário, buscar nos bans
                const bans = await guild.bans.fetch();
                const user = bans.find(ban => `${ban.user.username}#${ban.user.discriminator}` === input);
                if (!user) {
                    const errorMessage = ':x: Nenhum banimento encontrado para essa tag de usuário.';
                    return isInteraction
                        ? context.reply({ content: errorMessage, ephemeral: true })
                        : context.channel.send(errorMessage);
                }
                userId = user.user.id;
            } else {
                const errorMessage = ':x: Entrada inválida. Use um ID ou tag de usuário válida.';
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            }

            // Verificar se o usuário está realmente banido
            const isBanned = await guild.bans.fetch(userId).catch(() => null);
            if (!isBanned) {
                const errorMessage = ':x: Este usuário não está banido.';
                return isInteraction
                    ? context.reply({ content: errorMessage, ephemeral: true })
                    : context.channel.send(errorMessage);
            }

            // Tentar desbanir o usuário
            await guild.members.unban(userId);
            const successMessage = `✅ Usuário com ID ${userId} foi desbanido do servidor.`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: false })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[Unban Command] Erro ao desbanir o usuário:', error);
            const errorMessage = ':x: Ocorreu um erro ao tentar desbanir o usuário.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};