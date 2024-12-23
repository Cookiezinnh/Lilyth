const { SlashCommandBuilder } = require('discord.js');
const Warn = require('../../models/warns');
const { v4: uuidv4 } = require('uuid');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Adiciona um aviso a um usuário.')
        .addStringOption(option =>
            option.setName('alvo')
                .setDescription('Usuário e motivo no formato: "@usuario motivo" ou "ID motivo".')
                .setRequired(true)),
    requiredRoles: [roles.ADMIN, roles.MODERATOR], // Cargos permitidos para usar este comando

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let guild, options;

        // Determinar se o comando é via interação ou prefixo
        if (isInteraction) {
            guild = context.guild;
            options = context.options;
        } else {
            guild = context.guild;
            options = args;
        }

        // Obter entrada "alvo" (combinada para usuário e motivo)
        const input = isInteraction
            ? options.getString('alvo')
            : args.join(' ');

        if (!input) {
            const errorMessage = ':x: Você precisa fornecer um usuário e um motivo.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        // Extrair o usuário/ID e o motivo da entrada
        const targetId = input.match(/^<@!?(\d+)>/)?.[1] || input.split(' ')[0].replace(/[^0-9]/g, '');
        const reason = input.replace(/^<@!?(\d+)>|\d+/, '').trim();

        if (!reason) {
            const errorMessage = ':x: Você precisa especificar um motivo para o aviso.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        // Buscar o membro alvo pelo ID
        const targetMember = await guild.members.fetch(targetId).catch(() => null);

        if (!targetMember) {
            const errorMessage = ':x: Usuário não encontrado no servidor.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        const moderator = isInteraction ? context.user.id : context.author.id;

        try {
            let warnData = await Warn.findOne({ guildId: guild.id, userId: targetMember.id });
            const warnId = uuidv4();

            if (!warnData) {
                warnData = new Warn({
                    guildId: guild.id,
                    userId: targetMember.id,
                    warns: [],
                });
            }

            // Adicionar o aviso ao banco de dados
            warnData.warns.push({ id: warnId, reason, moderator });
            await warnData.save();

            const successMessage = `✅ ${targetMember.user.tag} recebeu um aviso: "${reason}". ID do Warn: \`${warnId}\``;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: true })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[Warn Command] Erro ao adicionar aviso:', error);
            const errorMessage = ':x: Ocorreu um erro ao adicionar o aviso.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};
