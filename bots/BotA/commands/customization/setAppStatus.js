const { SlashCommandBuilder } = require('discord.js');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setappstatus')
        .setDescription('Altera o status do bot.')
        .addStringOption(option =>
            option.setName('status')
                .setDescription('O novo status do bot.')
                .setRequired(true)
                .addChoices(
                    { name: 'Online', value: 'online' },
                    { name: 'Ausente', value: 'idle' },
                    { name: 'Não Perturbe', value: 'dnd' },
                    { name: 'Invisível', value: 'invisible' }
                )
        ),
    requiredRoles: [roles.ADMIN, roles.MODERATOR], // Cargos permitidos para usar este comando

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let member;

        // Identifica se é um comando Slash ou prefixado
        if (isInteraction) {
            member = context.member;
        } else {
            member = context.member || context.author;
        }

        const status = isInteraction 
            ? context.options.getString('status') 
            : args[0]; // Para prefixo, o status vem do primeiro argumento.

        if (!status) {
            const replyMessage = '⚠️ Você deve fornecer um status para o bot!';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        try {
            await context.client.user.setStatus(status);
            const successMessage = `✅ Status do bot atualizado para: \`${status}\`.`;
            return isInteraction
                ? context.reply({ content: successMessage })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('Erro ao definir o status:', error);
            const errorMessage = '❌ Não foi possível alterar o status.';
            return isInteraction
                ? context.reply({ content: errorMessage })
                : context.channel.send(errorMessage);
        }
    },
};