const { EmbedBuilder } = require('discord.js');
const channels = require('../../../../shared/channels');
const emojis = require('../../../../shared/emojis');

module.exports = async (client, interaction) => {
    try {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);

        // Caso o comando não seja encontrado
        if (!command) {
            await interaction.reply({
                content: `${emojis.x} Comando não encontrado!`,
                ephemeral: true,
            });

            const logChannel = await client.channels.fetch(channels.COMMANDS_LOG).catch(() => null);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle(`${emojis.warning} Comando Não Encontrado`)
                    .setDescription(
                        `**${emojis.user} Usuário** | ${interaction.user.tag}\n` +
                        `**${emojis.command} Comando Tentado** | \`/${interaction.commandName}\`\n` +
                        `**${emojis.id} Usuário ID** | ${interaction.user.id}`
                    )
                    .setColor('#ffcc00')
                    .setTimestamp()
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

                await logChannel.send({ embeds: [embed] });
            }
            return;
        }

        const memberRoles = interaction.member?.roles?.cache;
        const requiredRoles = command.requiredRoles || [];

        // Caso o usuário não tenha permissão
        if (requiredRoles.length > 0 && (!memberRoles || !requiredRoles.some(roleId => memberRoles.has(roleId)))) {
            await interaction.reply({
                content: `${emojis.x} Você não tem permissão para usar este comando.`,
                ephemeral: true,
            });

            const logChannel = await client.channels.fetch(channels.COMMANDS_LOG).catch(() => null);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle(`${emojis.forbidden} Tentativa de Uso de Comando`)
                    .setDescription(
                        `**${emojis.user} Usuário** | ${interaction.user.tag}\n` +
                        `**${emojis.command} Comando** | \`/${interaction.commandName}\`\n` +
                        `**${emojis.id} Usuário ID** | ${interaction.user.id}\n` +
                        `**${emojis.lock} Status** | Sem permissão`
                    )
                    .setColor('#ff3300')
                    .setTimestamp()
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

                await logChannel.send({ embeds: [embed] });
            }
            return;
        }

        // Execução do comando
        if (!interaction.deferred && !interaction.replied) {
            await command.execute(interaction, client);

            const logChannel = await client.channels.fetch(channels.COMMANDS_LOG).catch(() => null);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle(`${emojis.success} Comando Executado`)
                    .setDescription(
                        `**${emojis.user} Usuário** | ${interaction.user.tag}\n` +
                        `**${emojis.command} Comando** | \`/${interaction.commandName}\`\n` +
                        `**${emojis.id} Usuário ID** | ${interaction.user.id}`
                    )
                    .setColor('#00cc66')
                    .setTimestamp()
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

                await logChannel.send({ embeds: [embed] });
            }
        } else {
            console.warn(`[InteractionUpdate] A interação já foi respondida: ${interaction.commandName}`);
        }
    } catch (error) {
        console.error(`[InteractionUpdate] Erro ao executar o comando: ${interaction.commandName}`, error);

        if (!interaction.deferred && !interaction.replied) {
            await interaction.reply({
                content: `${emojis.x} Ocorreu um erro ao executar este comando.`,
                ephemeral: true,
            }).catch(() => null);
        }

        const logChannel = await client.channels.fetch(channels.USED_CMD_LOG).catch(() => null);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setTitle(`${emojis.error} Erro ao Executar Comando`)
                .setDescription(
                    `**${emojis.user} Usuário** | ${interaction.user.tag}\n` +
                    `**${emojis.command} Comando** | \`/${interaction.commandName}\`\n` +
                    `**${emojis.id} Usuário ID** | ${interaction.user.id}\n` +
                    `**${emojis.warning} Erro** | \`\`\`${error.message}\`\`\``
                )
                .setColor('#ff0000')
                .setTimestamp()
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

            await logChannel.send({ embeds: [embed] });
        }
    }
};