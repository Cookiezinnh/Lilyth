const { SlashCommandBuilder } = require('discord.js');
const PrivateVC = require('../../models/privateVoiceChannel.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeprivatevc')
        .setDescription('Remove seu canal de voz privado.'),
    requiredRoles: [], // Sem restrição de cargo
    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let guild, member;

        // Diferenciar comandos Slash e prefixados
        if (isInteraction) {
            guild = context.guild;
            member = context.member;
        } else {
            guild = context.guild;
            member = context.member || context.author; // Fallback seguro para comandos prefixados
        }

        // Verifica se `member` é válido
        if (!member || !guild) {
            const errorMessage = '❌ Não foi possível identificar o usuário ou servidor.';
            if (isInteraction) {
                return context.reply({ content: errorMessage, ephemeral: true });
            } else {
                return context.channel.send(errorMessage);
            }
        }

        try {
            // Buscar o canal de voz do usuário no banco de dados
            const privateVC = await PrivateVC.findOne({ ownerId: member.id });
            if (!privateVC) {
                const noChannelMessage = '⚠️ Você não possui um canal de voz privado ativo.';
                if (isInteraction) {
                    return context.reply({ content: noChannelMessage, ephemeral: true });
                } else {
                    return context.channel.send(noChannelMessage);
                }
            }

            // Deleta o canal de voz no Discord
            const channel = guild.channels.cache.get(privateVC.voiceChannelId);
            if (channel) {
                await channel.delete();
            }

            // Remove o registro do banco de dados
            await PrivateVC.deleteOne({ ownerId: member.id });

            const successMessage = '✅ Seu canal de voz privado foi removido com sucesso.';
            if (isInteraction) {
                await context.reply({ content: successMessage, ephemeral: true });
            } else {
                await context.channel.send(successMessage);
            }
        } catch (error) {
            console.error('[RemovePrivateVC] Erro ao remover canal privado:', error);
            const errorMessage = '❌ Ocorreu um erro ao tentar remover seu canal privado.';
            if (isInteraction) {
                await context.reply({ content: errorMessage, ephemeral: true });
            } else {
                await context.channel.send(errorMessage);
            }
        }
    },
};