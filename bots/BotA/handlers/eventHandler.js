const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const eventsPath = path.join(__dirname, '../events');
    const ignoredEvents = [];

    /**
     * Carrega todos os eventos de um diretório especificado
     * @param {string} directory Caminho do diretório a ser carregado
     */
    const loadEvents = (directory) => {
        const files = fs.readdirSync(directory);

        files.forEach((file) => {
            const filePath = path.join(directory, file);

            // Verifica se é um diretório para carregar recursivamente
            if (fs.statSync(filePath).isDirectory()) {
                loadEvents(filePath);
            } else if (file.endsWith('.js')) {
                handleEvent(filePath, file);
            }
        });
    };

    /**
     * Processa um único evento
     * @param {string} filePath Caminho completo do arquivo do evento
     * @param {string} file Nome do arquivo do evento
     */
    const handleEvent = (filePath, file) => {
        const eventName = path.basename(file, '.js');
        try {
            const event = require(filePath);

            // Verifica se o evento é uma função válida
            if (typeof event !== 'function') {
                throw new Error(`Estrutura inválida. O evento "${eventName}" não exporta uma função.`);
            }

            // Registra o evento no cliente
            client.on(eventName, (...args) => event(client, ...args));
            console.log(`🟩 | [EventHandler] Evento "${eventName}" carregado com sucesso.`);
        } catch (error) {
            console.warn(`🟨 | [EventHandler] Evento "${eventName}" ignorado.`);
            ignoredEvents.push({ event: eventName, error: error.message });
        }
    };

    // Carrega os eventos a partir do diretório base
    try {
        loadEvents(eventsPath);
    } catch (error) {
        console.error(`🟥 | [EventHandler] Erro fatal ao carregar eventos: ${error.message}`);
    }

    // Exibe detalhes dos eventos ignorados ao final
    if (ignoredEvents.length > 0) {
        console.warn(`🟥 | [EventHandler] Resumo de eventos ignorados:`);
        ignoredEvents.forEach(({ event, error }) => {
            console.warn(` - Evento: "${event}", Erro: ${error}`);
        });
    }
};