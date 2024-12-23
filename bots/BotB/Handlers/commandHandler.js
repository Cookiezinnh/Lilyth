const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const commandsPath = path.join(__dirname, '../Commands');
    const commands = [];

    fs.readdirSync(commandsPath).forEach(folder => {
        const folderPath = path.join(commandsPath, folder);
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`${folderPath}/${file}`);
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON()); // Adiciona o comando à lista para registro posterior
        }
    });

    // Salva os comandos no cliente para uso no evento `ready`
    client.commandData = commands;
};
