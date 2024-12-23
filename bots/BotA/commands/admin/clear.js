const { SlashCommandBuilder } = require('discord.js');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Limpa mensagens do canal.')
        .addIntegerOption(option =>
            option.setName('quantidade')
                .setDescription('Número de mensagens a limpar.')
                .setRequired(true)
        ),
    requiredRoles: [roles.ADMIN, roles.MODERATOR], // Cargos permitidos para usar este comando

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let channel, member, quantidade;

        // Identifica se é um comando Slash ou prefixado
        if (isInteraction) {
            channel = context.channel;
            member = context.member;
            quantidade = context.options.getInteger('quantidade');
        } else {
            channel = context.channel;
            member = context.member || context.author;
            quantidade = parseInt(args[0], 10);

            if (isNaN(quantidade)) {
                return context.channel.send('❌ Você deve fornecer um número válido de mensagens para limpar.');
            }
        }

        // Verifica se o número de mensagens está dentro do limite
        if (quantidade < 1 || quantidade > 100) {
            const replyMessage = '❌ A quantidade deve estar entre 1 e 100.';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        // Verifica se o usuário tem a permissão necessária
        const hasPermission = module.exports.requiredRoles.some(role => member.roles?.cache.has(role));
        if (!hasPermission) {
            const replyMessage = '❌ Você não tem permissão para usar este comando.';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        try {
            const messages = await channel.bulkDelete(quantidade, true);
            const successMessage = `✅ ${messages.size} mensagens removidas.`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: false })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[Clear] Erro ao limpar mensagens:', error);
            const errorMessage = '❌ Não foi possível limpar as mensagens.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};