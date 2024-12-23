const channels = require('../../../shared/channels');

module.exports = async (client, error) => {
    console.error('[Event] Erro capturado:', error);
    const errorChannel = await client.channels.fetch(channels.ERROR_CHANNEL);
    if (errorChannel) errorChannel.send(`:x: **Erro capturado:**\n\`\`\`${error}\`\`\``);
};
