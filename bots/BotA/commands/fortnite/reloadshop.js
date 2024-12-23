const { SlashCommandBuilder } = require('discord.js');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reloadshop')
        .setDescription('Atualiza manualmente a loja do Fortnite'),
    requiredRoles: [], // Nenhuma restrição de cargo
    async execute(context, args) {
        const isInteraction = context.isCommand?.(); // Verifica se é uma interação

        try {
            // Responde imediatamente para evitar expiração (interações) ou feedback inicial (mensagens)
            if (isInteraction) {
                await context.reply({ content: '⏳ Atualizando a loja do Fortnite...', ephemeral: true });
            } else {
                await context.channel.send('⏳ Atualizando a loja do Fortnite...');
            }

            // Atualiza a loja se a função estiver disponível
            if (typeof context.client.updateShop === 'function') {
                await context.client.updateShop();

                if (isInteraction) {
                    await context.editReply('✅ A loja do Fortnite foi atualizada com sucesso!');
                } else {
                    await context.channel.send('✅ A loja do Fortnite foi atualizada com sucesso!');
                }
            } else {
                const errorMsg = '❌ A função de atualização da loja não foi encontrada.';
                if (isInteraction) {
                    await context.editReply(errorMsg);
                } else {
                    await context.channel.send(errorMsg);
                }
                console.warn('[ReloadShop] Função updateShop não está disponível.');
            }
        } catch (error) {
            console.error('[ReloadShop] Erro ao atualizar a loja:', error);

            const errorMsg = '❌ Ocorreu um erro ao tentar atualizar a loja.';
            if (isInteraction) {
                await context.editReply(errorMsg);
            } else {
                await context.channel.send(errorMsg);
            }
        }
    },
};