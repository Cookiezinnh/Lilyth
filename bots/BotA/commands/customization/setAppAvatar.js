const { SlashCommandBuilder } = require('discord.js');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setappavatar')
        .setDescription('Altera o avatar do bot.')
        .addAttachmentOption(option =>
            option.setName('imagem')
                .setDescription('Imagem para definir como avatar do bot.')
                .setRequired(true)
        ),
    requiredRoles: [roles.ADMIN, roles.MODERATOR], // Cargos permitidos para usar este comando

    async execute(context) {
        const isInteraction = context.isCommand?.();
        let imagem;

        // Identifica se é um comando Slash ou prefixado
        if (isInteraction) {
            imagem = context.options.getAttachment('imagem');
        } else {
            // Para prefixo, pega o primeiro anexo da mensagem
            const attachment = context.attachments.first();
            imagem = attachment && ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'].includes(attachment.contentType)
                ? attachment
                : null;
        }

        // Verifica se a imagem é válida
        if (!imagem) {
            const replyMessage = '❌ O arquivo deve ser uma imagem válida (PNG, JPEG, JPG ou GIF).';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        try {
            await context.client.user.setAvatar(imagem.url);
            const successMessage = '✅ Avatar do bot alterado com sucesso.';
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('Erro ao alterar o avatar:', error);
            const errorMessage = '❌ Não foi possível alterar o avatar.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};
