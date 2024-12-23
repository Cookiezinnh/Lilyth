const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const config = require('../config.json');

module.exports = async (client) => {
    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
        console.log(`🟩 | [Handler] ${client.user.username} // Registrando comandos na API do Discord...`);
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: client.commandData }
        );
        console.log(`🟩 | [Handler] ${client.user.username} // Comandos Registrados com Sucesso!`);
    } catch (error) {
        console.error(`🟥 | [Handler] ${client.user.username} // Erro ao Registrar o(s) Comando(s):`, error);
    }

    console.log(`🟩 | [Bot] ${client.user.username} // está pronto(a)!`);
};
