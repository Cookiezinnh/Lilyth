const { SlashCommandBuilder } = require('discord.js');
const Warn = require('../../models/warns');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warns')
        .setDescription('Exibe os avisos de um usuário.')
        .addStringOption(option =>
            option.setName('alvo')
                .setDescription('Usuário ou ID do alvo cujos avisos serão exibidos.')
                .setRequired(true)),
    requiredRoles: [roles.ADMIN, roles.MODERATOR], // Cargos permitidos para usar este comando

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let guild, options;

        // Determina se é Slash Command ou comando prefixado
        if (isInteraction) {
            guild = context.guild;
            options = context.options;
        } else {
            guild = context.guild;
            options = args;
        }

        // Capturar o input do campo "alvo"
        const targetInput = isInteraction
            ? options.getString('alvo')
            : args[0];

        if (!targetInput) {
            const errorMessage = ':x: Você precisa fornecer um usuário ou ID.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        // Extrair o ID do usuário (caso seja menção) ou tentar interpretar como tag/nome
        const targetId = targetInput.match(/^<@!?(\d+)>/)?.[1] || targetInput.replace(/[^0-9]/g, '');
        const targetUser = await guild.members.fetch(targetId).catch(() => null);

        if (!targetUser) {
            const errorMessage = ':x: Usuário não encontrado no servidor.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        try {
            // Buscar os avisos do banco de dados
            const warnData = await Warn.findOne({ guildId: guild.id, userId: targetUser.id });

            if (!warnData || !warnData.warns.length) {
                const noWarnsMessage = `:x: ${targetUser.user.tag} não possui avisos.`;
                return isInteraction
                    ? context.reply({ content: noWarnsMessage, ephemeral: true })
                    : context.channel.send(noWarnsMessage);
            }

            // Listar os avisos
            const warnList = warnData.warns
                .map(warn =>
                    `ID: \`${warn.id}\` - Motivo: "${warn.reason}" - Por: <@${warn.moderator}> em ${new Date(warn.date).toLocaleString()}`
                )
                .join('\n');

            const successMessage = `📋 Avisos de ${targetUser.user.tag}:\n\n${warnList}`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: false })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[Warns Command] Erro ao buscar avisos:', error);
            const errorMessage = ':x: Ocorreu um erro ao buscar os avisos.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};
