const { EmbedBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const config = require('../../config.json');
const channels = require('../../../../shared/channels'); // Canal para logs

module.exports = async (client) => {
    const rest = new REST({ version: '10' }).setToken(config.token);
    const logEmbeds = [];

    try {
        const startEmbed = new EmbedBuilder()
            .setTitle('📤 Registro de Comandos')
            .setDescription(`**${client.user.username} |** Registrando comandos na API do Discord...`)
            .setColor('#1ABC9C')
            .setTimestamp()
            .setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL() });

        logEmbeds.push(startEmbed);

        // Registra os comandos na API
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: client.commandData }
        );

        const successEmbed = new EmbedBuilder()
            .setTitle('✅ Comandos Registrados com Sucesso')
            .setDescription(`Os comandos foram registrados com sucesso na API do Discord!`)
            .setColor('#2ECC71')
            .setTimestamp()
            .setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL() });

        logEmbeds.push(successEmbed);

        console.log(`🟩 | [Handler] ${client.user.username} // Comandos Registrados com Sucesso!`);
    } catch (error) {
        console.error(`🟥 | [Handler] ${client.user.username} // Erro ao Registrar o(s) Comando(s):`, error);

        const errorEmbed = new EmbedBuilder()
            .setTitle('🛑 Erro ao Registrar Comandos')
            .setDescription(`Ocorreu um erro ao tentar registrar os comandos na API do Discord.`)
            .addFields({ name: 'Detalhes do Erro', value: `\`\`\`${error.message || 'Nenhuma informação adicional.'}\`\`\`` })
            .setColor('#E74C3C')
            .setTimestamp()
            .setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL() });

        logEmbeds.push(errorEmbed);
    }

    // Mensagem final após a inicialização do bot
    const readyEmbed = new EmbedBuilder()
        .setTitle('🤖 Bot Pronto!')
        .setDescription(`**${client.user.username} |** está online e pronto(a) para uso!`)
        .setColor('#3498DB')
        .setTimestamp()
        .setFooter({ text: `${client.user.username}`, iconURL: client.user.displayAvatarURL() });

    logEmbeds.push(readyEmbed);

    console.log(`🟩 | [Bot] ${client.user.username} // está pronto(a)!`);

    // Envia os embeds no canal de log designado
    try {
        const logChannel = await client.channels.fetch(channels.STATUS_CHANNEL); // Canal de log especificado
        if (logChannel) {
            for (const embed of logEmbeds) {
                await logChannel.send({ embeds: [embed] });
            }
        } else {
            console.warn('🟥 | [Handler] Canal de log não encontrado ou inválido.');
        }
    } catch (error) {
        console.error('🟥 | [Handler] Erro ao enviar mensagens para o canal de log:', error);
    }
};