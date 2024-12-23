const { google } = require('googleapis');
const config = require('../config.json');
const SearchCache = require('../models/MusicSearchCache');

const youtube = google.youtube({
    version: 'v3',
    auth: config.youtubeApiKey, // Obtendo a chave do config.json
});

/**
 * Realiza uma busca no YouTube pelo nome ou termo da música.
 * @param {string} query - Nome ou termo da busca.
 * @returns {Promise<string>} URL do vídeo do YouTube.
 * @throws {Error} Lança um erro se nenhum resultado for encontrado.
 */
async function searchYouTube(query) {
    const response = await youtube.search.list({
        q: query,
        part: 'snippet',
        maxResults: 1,
        type: 'video',
    });

    if (response.data.items.length) {
        return `https://www.youtube.com/watch?v=${response.data.items[0].id.videoId}`;
    } else {
        throw new Error('Nenhum resultado encontrado no YouTube.');
    }
}

/**
 * Armazena em cache o termo de busca e sua URL correspondente.
 * @param {string} query - Termo de busca.
 * @param {string} url - URL do vídeo do YouTube.
 * @returns {Promise<void>}
 */
async function cacheSearch(query, url) {
    const searchEntry = new SearchCache({ query, url });
    await searchEntry.save();
}

/**
 * Verifica se um termo de busca já foi registrado no cache.
 * @param {string} query - Termo de busca.
 * @returns {Promise<string|null>} URL do vídeo armazenada no cache ou `null` se não existir.
 */
async function getCachedSearch(query) {
    const result = await SearchCache.findOne({ query });
    if (result) {
        return result.url;
    }
    return null;
}

module.exports = { searchYouTube, cacheSearch, getCachedSearch };