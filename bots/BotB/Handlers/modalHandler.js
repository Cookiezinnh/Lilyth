// Exemplo para gerenciar modals
module.exports = (client) => {
    client.on('interactionCreate', interaction => {
        if (!interaction.isModalSubmit()) return;
        const modal = client.modals.get(interaction.customId);
        if (!modal) return;
        modal.execute(interaction);
    });
};
