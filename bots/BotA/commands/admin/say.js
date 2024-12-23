const { SlashCommandBuilder, ChannelType } = require('discord.js');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Faz o bot dizer algo.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('A mensagem que o bot irá dizer.')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Canal onde a mensagem será enviada.')
                .addChannelTypes(ChannelType.GuildText) // Apenas canais de texto
                .setRequired(false)),
    requiredRoles: [roles.ADMIN, roles.MODERATOR], // Cargos permitidos para usar este comando

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let member, guild, message, targetChannel;

        // Identifica o tipo de comando
        if (isInteraction) {
            member = context.member;
            guild = context.guild;
            message = context.options.getString('message');
            targetChannel = context.options.getChannel('channel') || context.channel;
        } else {
            member = context.member || context.author;
            guild = context.guild;
            message = args.join(' ');
            targetChannel = context.mentions.channels.first() || context.channel;
        }

        // Verifica se o membro possui os cargos necessários
        const hasPermission = member.roles.cache.some(role => 
            this.requiredRoles.includes(role.id)
        );
        if (!hasPermission) {
            const replyMessage = '⚠️ Você não tem permissão para usar este comando.';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        if (!message) {
            const replyMessage = '⚠️ Você precisa especificar a mensagem a ser enviada.';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        try {
            await targetChannel.send(message);

            // Envia mensagem de sucesso apenas se for via Slash Command
            if (isInteraction) {
                const successMessage = `✅ Mensagem enviada em ${targetChannel}.`;
                return context.reply({ content: successMessage, ephemeral: true });
            }
        } catch (error) {
            console.error('[Say Command] Erro ao enviar mensagem:', error);
            const errorMessage = '❌ Ocorreu um erro ao tentar enviar a mensagem.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};