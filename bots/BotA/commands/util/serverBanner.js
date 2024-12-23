const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverbanner')
        .setDescription('Envia o banner do servidor.'),
    requiredRoles: [], // Nenhuma restrição de cargo
    async execute(context) {
        const isInteraction = context.isCommand?.();
        let guild, member;

        // Identifica se é um comando Slash ou prefixado
        if (isInteraction) {
            guild = context.guild;
        } else {
            guild = context.guild;
        }

        if (!guild.bannerURL()) {
            const replyMessage = '❌ Este servidor não possui banner.';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        const bannerURL = guild.bannerURL({ dynamic: true, size: 1024 });

        const successMessage = `🖼️ Banner do servidor:`;
        return isInteraction
            ? context.reply({ content: successMessage, files: [bannerURL] })
            : context.channel.send({ content: successMessage, files: [bannerURL] });
    },
};