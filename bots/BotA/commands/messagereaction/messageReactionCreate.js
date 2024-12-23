const { SlashCommandBuilder } = require('discord.js');
const ReactionRole = require('../../models/reactionRoles.js');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('messagereactioncreate')
        .setDescription('Cria um sistema de reação para ganhar cargos.')
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('ID da mensagem alvo.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji a ser usado.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('roleid')
                .setDescription('ID do cargo que será atribuído.')
                .setRequired(true)),
    requiredRoles: [roles.ADMIN, roles.MODERATOR], // Cargos permitidos para usar este comando
    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const guild = isInteraction ? context.guild : context.guild;
        const messageId = isInteraction ? context.options.getString('messageid') : args[0];
        const emoji = isInteraction ? context.options.getString('emoji') : args[1];
        const roleId = isInteraction ? context.options.getString('roleid') : args[2].replace(/[<@&>]/g, '');

        try {
            // Salva no banco de dados
            const newReactionRole = new ReactionRole({ messageId, emoji, roleId, guildId: guild.id });
            await newReactionRole.save();

            // Busca a mensagem e adiciona a reação
            const channel = isInteraction ? context.channel : context.channel;
            const message = await channel.messages.fetch(messageId);
            await message.react(emoji);

            const successMessage = `✅ Sistema de reação criado com sucesso para a mensagem ${messageId}!`;
            if (isInteraction) {
                await context.reply(successMessage);
            } else {
                await context.channel.send(successMessage);
            }
        } catch (error) {
            console.error('[ReactionCreate] Erro ao criar sistema de reação:', error);
            const errorMessage = '❌ Ocorreu um erro ao criar o sistema de reação.';
            if (isInteraction) {
                await context.reply(errorMessage);
            } else {
                await context.channel.send(errorMessage);
            }
        }
    },
};