const fs = require('fs');
const path = require('path');
const Prefix = require('../models/prefix'); // Modelo do prefixo
const config = require('../config.json'); // Configuração contendo o prefixo padrão

module.exports = (client) => {
    const commandsPath = path.join(__dirname, '../commands');
    const commands = [];
    const ignoredCommands = [];

    /**
     * Carrega todos os comandos de um diretório especificado
     * @param {string} directory Caminho do diretório a ser carregado
     */
    const loadCommands = (directory) => {
        const files = fs.readdirSync(directory);

        files.forEach((file) => {
            const filePath = path.join(directory, file);

            if (fs.statSync(filePath).isDirectory()) {
                loadCommands(filePath);
            } else if (file.endsWith('.js')) {
                handleCommand(filePath, file);
            }
        });
    };

    /**
     * Processa um único comando
     * @param {string} filePath Caminho completo do arquivo do comando
     * @param {string} file Nome do arquivo do comando
     */
    const handleCommand = (filePath, file) => {
        try {
            const command = require(filePath);

            if (!command?.data?.name) {
                throw new Error('Estrutura inválida: comando deve exportar "data" e "name".');
            }

            command.aliases = command.aliases || [];
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());

            console.log(`🟩 | [CommandHandler] Comando "${command.data.name}" carregado com sucesso.`);
        } catch (error) {
            console.warn(`🟨 | [CommandHandler] Comando "${file}" ignorado.`);
            ignoredCommands.push({ command: file, error: error.message });
        }
    };

    // Carrega os comandos
    try {
        loadCommands(commandsPath);
    } catch (error) {
        console.error(`🟥 | [CommandHandler] Erro fatal ao carregar comandos: ${error.message}`);
    }

    client.commandData = commands;

    if (ignoredCommands.length > 0) {
        console.warn(`🟨 | [CommandHandler] Resumo de comandos ignorados:`);
        ignoredCommands.forEach(({ command, error }) => {
            console.warn(` - Comando: "${command}", Erro: ${error}`);
        });
    }

    // Evento para processar mensagens com prefixo
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;
    
        // Busca o prefixo do banco ou usa o padrão
        const guildId = message.guild?.id;
        const guildPrefix = guildId
            ? (await Prefix.findOne({ guildId }))?.prefix || config.defaultprefix
            : config.defaultprefix;
    
        if (!message.content.startsWith(guildPrefix)) return;
    
        const args = message.content.slice(guildPrefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName) ||
                        client.commands.find(cmd => cmd.aliases?.includes(commandName));
    
        if (!command) return;
    
        try {
            // Verifica restrições de cargos, se existirem
            if (command.requiredRoles && command.requiredRoles.length > 0) {
                const memberRoles = message.member.roles.cache;
                if (!command.requiredRoles.some(roleId => memberRoles.has(roleId))) {
                    return message.reply(':x: Você não tem permissão para usar este comando.');
                }
            }
    
            // Executa o comando
            await command.execute(message, args);
        } catch (error) {
            console.error(`🟥 | [CommandHandler] Erro ao executar comando "${commandName}":`, error);
            await message.reply(':x: Ocorreu um erro ao executar o comando.');
        }
    });
};