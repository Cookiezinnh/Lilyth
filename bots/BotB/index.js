const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const channels = require('../../shared/channels');
require('dotenv').config();

const config = require('./config.json');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Configurações básicas
client.commands = new Collection();
client.modals = new Collection();
client.events = new Collection();

// Conexão ao MongoDB
mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log(`🟩 | [MongoDB] ${client.user.username} // Conectado a MongoDB`))
    .catch(err => console.error(`🟥 | [MongoDB] ${client.user.username} // Erro ao Conectar a MongoDB`, err));

// Carregar handlers
const handlersPath = path.join(__dirname, 'Handlers');
fs.readdirSync(handlersPath).forEach(handler => {
    require(`${handlersPath}/${handler}`)(client);
});

// Gerenciar erros globais
process.on('unhandledRejection', async (error) => {
    console.error(`🟩 | [Bot] ${client.user.username} // Erro não Tratado:`, error);
    const errorChannel = await client.channels.fetch(channels.ERROR_CHANNEL);
    if (errorChannel) errorChannel.send(`:x: **Erro:**\n\`\`\`${error}\`\`\``);
});

process.on('SIGINT', async () => {
    const statusChannel = await client.channels.fetch(channels.STATUS_CHANNEL);
    if (statusChannel) statusChannel.send(`🟥 | [Bot] ${client.user.username} // A aplicação está desligando...`);
    process.exit(0);
});

// Login do bot
client.login(config.token).then(async () => {
    const statusChannel = await client.channels.fetch(channels.STATUS_CHANNEL);
    if (statusChannel) statusChannel.send(':white_check_mark: **Bot está online!**');
    console.log(`🟩 | [Bot] ${client.user.username} // está online!`);
}).catch(err => {
    console.error(`🟥 | [Bot] ${client.user.username} // erro ao Logar:`, err);
});
