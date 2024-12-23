const axios = require('axios');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config.json');
const channels = require('../../../../shared/channels');

module.exports = async (client) => {
    const updateShop = async () => {
        try {
            const channel = client.channels.cache.get(channels.FORTNITE_STORE_CHANNEL);
            if (!channel) {
                console.error('🟥 | [ShopHandler] Canal não encontrado ou ID inválido. Verifique o FORTNITE_STORE_CHANNEL em shared/channels.js.');
                return;
            }
            
            if (!channel.permissionsFor(client.user).has(['SendMessages', 'ViewChannel'])) {
                console.error('🟥 | [ShopHandler] Permissões insuficientes para enviar mensagens no canal.');
                return;
            }            

            const response = await axios.get('https://fortnite-api.com/v2/shop', {
                headers: { Authorization: config.fortniteApiKey },
            });

            let shopEntries = response.data?.data?.entries || [];

            // Filtrar itens válidos
            shopEntries = shopEntries.filter(entry => {
                const cosmetic = entry.brItems?.[0];
                const category = entry.layout?.name?.toLowerCase();
                return (
                    cosmetic?.name &&
                    cosmetic?.description &&
                    !['bundles', 'car', 'jamtracks'].includes(category)
                );
            });

            if (shopEntries.length === 0) {
                await channel.send('A loja do Fortnite está vazia ou não contém itens válidos no momento.');
                return;
            }

            // Agrupar itens por categorias
            const categories = {};
            shopEntries.forEach(entry => {
                const category = entry.layout?.name || 'Outros';
                if (!categories[category]) categories[category] = [];
                categories[category].push(entry);
            });

            // Excluir mensagens antigas antes de enviar as novas
            const oldMessages = await channel.messages.fetch({ limit: 100 });
            for (const msg of oldMessages.values()) {
                if (msg.deletable) await msg.delete();
            }

            // Enviar mensagens por categoria
            for (const [categoryName, items] of Object.entries(categories)) {
                let currentPage = 0;

                const createEmbed = (pageIndex) => {
                    const item = items[pageIndex];
                    const cosmetic = item.brItems?.[0];
                    const itemColor = cosmetic?.colors?.primary || '#ff0000';
                    return new EmbedBuilder()
                        .setTitle(cosmetic.name)
                        .setDescription(cosmetic.description)
                        .setThumbnail(cosmetic?.images?.smallIcon || null)
                        .setImage(cosmetic?.images?.icon || null)
                        .setColor(itemColor)
                        .addFields(
                            { name: 'Preço', value: `${item.finalPrice} V-Bucks`, inline: true },
                            { name: 'Giftável', value: item.giftable ? 'Sim' : 'Não', inline: true },
                            { name: 'Reembolsável', value: item.refundable ? 'Sim' : 'Não', inline: true },
                        )
                        .setAuthor({ name: categoryName })
                        .setFooter({ text: `Última atualização: ${new Date().toLocaleString()}` })
                        .setTimestamp();
                };

                const updateButtons = (pageIndex) => {
                    return new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`previous_${categoryName}`)
                            .setLabel('⬅️ Anterior')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(pageIndex === 0),
                        new ButtonBuilder()
                            .setCustomId(`next_${categoryName}`)
                            .setLabel('➡️ Próximo')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(pageIndex === items.length - 1)
                    );
                };

                const embed = createEmbed(currentPage);
                const buttons = updateButtons(currentPage);

                const message = await channel.send({ embeds: [embed], components: [buttons] });

                const collector = message.createMessageComponentCollector();

                collector.on('collect', async (i) => {
                    if (i.customId === `previous_${categoryName}`) currentPage--;
                    if (i.customId === `next_${categoryName}`) currentPage++;

                    const updatedEmbed = createEmbed(currentPage);
                    const updatedButtons = updateButtons(currentPage);

                    await i.update({
                        embeds: [updatedEmbed],
                        components: [updatedButtons],
                    });
                });
            }

            console.log('🟩 | [ShopHandler] Loja atualizada com sucesso!');
        } catch (error) {
            console.error('🟥 | [ShopHandler] Erro ao atualizar a loja do Fortnite:', error);
        }
    };

    client.updateShop = updateShop; // Disponibiliza a função para uso global
    await updateShop(); // Atualiza ao iniciar
};