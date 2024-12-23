const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const componentsPath = path.join(__dirname, '../components');

    // Verifica se o diretório existe
    if (!fs.existsSync(componentsPath)) {
        console.warn('🟥 | [Component Handler] Diretório Components não encontrado. Ignorando carregamento de componentes.');
        return;
    }

    client.components = new Map();

    fs.readdirSync(componentsPath).forEach(folder => {
        const folderPath = path.join(componentsPath, folder);
        fs.readdirSync(folderPath).forEach(file => {
            const component = require(`${folderPath}/${file}`);
            client.components.set(component.id, component);
        });
    });

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isButton()) return;

        const component = client.components.get(interaction.customId);
        if (!component) return;

        try {
            await component.execute(interaction, client);
        } catch (error) {
            console.error(`🟥 | [Component Handler] Erro no componente ${interaction.customId}:`, error);
            await interaction.reply({
                content: '❌ Ocorreu um erro ao executar esta ação.',
                ephemeral: true,
            });
        }
    });
};