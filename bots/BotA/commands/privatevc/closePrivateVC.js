const { SlashCommandBuilder } = require('discord.js');
const Categories = require('../../../../shared/categories.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('closeprivatevc')
        .setDescription('Fecha o seu canal de voz temporário.'),

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let guild, member;

        // Identifica se é um comando Slash ou prefixado
        if (isInteraction) {
            guild = context.guild;
            member = context.member;
        } else {
            guild = context.guild;
            member = context.member || context.author;
        }

        // Verifica se o membro está em um canal de voz
        const voiceState = guild.voiceStates.cache.get(member.id);
        if (!voiceState?.channel) {
            const replyMessage = '⚠️ Você não está em um canal de voz!';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        const channel = voiceState.channel;

        // Verifica se está em uma categoria específica
        if (channel.parentId !== Categories.CLONED_VC_CATEGORY) {
            const replyMessage = '⚠️ Este canal não pode ser fechado com este comando!';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        try {
            await channel.delete();
            const successMessage = '✅ O canal temporário foi fechado.';
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[ClosePrivateVC] Erro ao deletar o canal:', error);
            const errorMessage = '❌ Ocorreu um erro ao fechar o canal.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};