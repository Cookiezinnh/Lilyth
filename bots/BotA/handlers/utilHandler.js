const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const utilsPath = path.join(__dirname, '../utils');
    const utils = {};

    /**
     * Carrega todos os utilitários de um diretório especificado
     * @param {string} directory Caminho do diretório a ser carregado
     */
    const loadUtils = (directory) => {
        const files = fs.readdirSync(directory);

        files.forEach((file) => {
            const filePath = path.join(directory, file);

            if (fs.statSync(filePath).isDirectory()) {
                loadUtils(filePath);
            } else if (file.endsWith('.js')) {
                handleUtil(filePath, file);
            }
        });
    };

    /**
     * Processa um único utilitário
     * @param {string} filePath Caminho completo do arquivo do utilitário
     * @param {string} file Nome do arquivo do utilitário
     */
    const handleUtil = (filePath, file) => {
        try {
            const util = require(filePath);

            const utilName = path.basename(file, '.js');
            utils[utilName] = util;

            console.log(`🟩 | [UtilsHandler] Utilitário "${utilName}" carregado com sucesso.`);
        } catch (error) {
            console.warn(`🟨 | [UtilsHandler] Utilitário "${file}" ignorado devido a erro: ${error.message}`);
        }
    };

    // Carrega os utilitários
    try {
        loadUtils(utilsPath);
    } catch (error) {
        console.error(`🟥 | [UtilsHandler] Erro fatal ao carregar utilitários: ${error.message}`);
    }

    // Adiciona os utils ao client para acesso global
    client.utils = utils;
};