const { Client, GatewayIntentBits, Collection, EmbedBuilder, Colors } = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');

const Prefix = require('./models/prefix'); // Adicionar a importação do modelo
const channels = require('../../shared/channels');
const config = require('./config.json');
const Mute = require('./models/mute'); // Ajuste para o caminho e nome correto

const client = new Client({
    intents: [
        // Intents de Guilda
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,

        // Intents de Mensagens Diretas
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,

        // Conteúdo das Mensagens
        GatewayIntentBits.MessageContent,
    ],
});
require('dotenv').config();

// Configurações básicas
client.commands = new Collection();
client.events = new Collection();

// Conexão ao MongoDB
mongoose.connect(config.mongoUri)
    .then(() => console.log(`🟩 | [MongoDB] Conectado com sucesso.`))
    .catch(err => console.error(`🟥 | [MongoDB] Erro ao conectar:`, err));

// Carregar handlers
const handlersPath = path.join(__dirname, 'handlers');
if (fs.existsSync(handlersPath)) {
    fs.readdirSync(handlersPath).forEach(handler => {
        try {
            const handlerModule = require(`${handlersPath}/${handler}`);
            if (typeof handlerModule === 'function') {
                handlerModule(client);
            }
        } catch (error) {
            console.error(`🟩 | [Handlers] Erro ao carregar handler "${handler}":`, error);
        }
    });
}

// Handler de Música
const musicHandlerPath = path.join(__dirname, 'API/MusicAPI/musicHandler.js');
try {
    const musicHandler = require(musicHandlerPath);
    if (typeof musicHandler === 'function') {
        musicHandler(client);
        console.log('🟩 | [MusicHandler] Handler de música carregado com sucesso.');
    } else {
        console.error('🟥 | [MusicHandler] O handler de música não exporta uma função válida.');
    }
} catch (error) {
    console.error('🟥 | [MusicHandler] Erro ao carregar o handler de música:', error);
}

// Login do bot
client.login(config.token).then(async () => {
    console.log(`🟩 | [Bot] ${client.user.username} // está online!`);

    const statusChannel = await client.channels.fetch(channels.STATUS_CHANNEL);
    if (statusChannel) {
        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle(':white_check_mark: Bot Online')
            .setDescription(`O bot **${client.user.username}** está agora online e pronto para uso!`)
            .setTimestamp()
            .setFooter({ text: 'Status do Bot', iconURL: client.user.displayAvatarURL() });

        await statusChannel.send({ embeds: [embed] });
    }   

    // Handler da API do Fortnite
    const shopHandlerPath = path.join(__dirname, 'API/FortniteAPI/shopHandler.js');
    try {
        const shopHandler = require(shopHandlerPath);
        if (typeof shopHandler === 'function') {
            await shopHandler(client);
            console.log('🟩 | [Handlers] Handler da loja Fortnite carregado com sucesso após o login.');
        } else {
            console.error('🟥 | [Handlers] shopHandler não exporta uma função válida.');
        }
    } catch (error) {
        console.error('🟥 | [Handlers] Erro ao carregar o handler da loja Fortnite após o login:', error);
    }   
    
    // Restaura mutes ativos
    try {
        const mutes = await Mute.find();

        for (const mute of mutes) {
            const guild = client.guilds.cache.get(mute.guildId);
            if (!guild) continue;

            const member = guild.members.cache.get(mute.userId);
            const muteRole = guild.roles.cache.get(mute.muteRoleId);

            if (member && muteRole) {
                const remainingTime = mute.unmuteAt.getTime() - Date.now();
                if (remainingTime > 0) {
                    setTimeout(async () => {
                        await member.roles.remove(muteRole);
                        await Mute.findOneAndDelete({ guildId: mute.guildId, userId: mute.userId });
                        console.log(`🟩 | [Mute Restore] Mute removido de ${member.user.tag}.`);
                    }, remainingTime);
                } else {
                    await member.roles.remove(muteRole);
                    await Mute.findOneAndDelete({ guildId: mute.guildId, userId: mute.userId });
                    console.log(`🟩 | [Mute Restore] Mute expirado removido de ${member.user.tag}.`);
                }
            }
        }

        console.log('🟩 | [Mute Restore] Todos os mutes ativos foram restaurados.');
    } catch (error) {
        console.error('🟥 | [Mute Restore] Erro ao restaurar mutes ativos:', error);
    }
}).catch(err => {
    console.error(`🟥 | [Bot] Erro ao logar:`, err);
});

// Atualizar loja de Fortnite de hora em hora
schedule.scheduleJob('0 * * * *', async () => {
    console.log('🟩 | [Scheduler] Atualizando a loja do Fortnite.');
    if (typeof client.updateShop === 'function') {
        await client.updateShop();
    } else {
        console.warn('🟥 | [Scheduler] Função updateShop não encontrada.');
    }
});