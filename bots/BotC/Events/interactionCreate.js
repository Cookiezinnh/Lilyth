module.exports = async (client, interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        return interaction.reply({
            content: ':x: Comando não encontrado!',
            ephemeral: true,
        });
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`[Handler] Erro ao executar o comando: ${interaction.commandName}`, error);
        await interaction.reply({
            content: ':x: Ocorreu um erro ao executar este comando.',
            ephemeral: true,
        });
    }
};
