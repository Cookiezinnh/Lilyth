const { SlashCommandBuilder } = require('discord.js');
const SoftLock = require('../../models/softlock');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('softlock')
        .setDescription('Impede temporariamente um usuário de participar das atividades do servidor.')
        .addStringOption(option =>
            option.setName('usuario')
                .setDescription('Usuário ou ID do usuário a ser softlockado.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('Motivo para aplicar o softlock.')
                .setRequired(true)),
    requiredRoles: [roles.ADMIN, roles.MODERATOR],

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let guild, options;

        // Identifica se é um comando Slash ou prefixado
        if (isInteraction) {
            guild = context.guild;
            options = context.options;
        } else {
            guild = context.guild;
            options = args;
        }

        // Obter o alvo (nome, menção ou ID)
        const targetInput = isInteraction
            ? options.getString('usuario')
            : args[0];

        const reason = isInteraction
            ? options.getString('motivo')
            : args.slice(1).join(' ');

        // Verifica se o cargo de softlock existe
        const softlockRole = guild.roles.cache.get(roles.SOFTLOCKED_ROLE);
        if (!softlockRole) {
            const replyMessage = ':x: O cargo "Softlock" não foi encontrado.';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        // Tentar obter o membro pelo ID, menção ou nome
        const targetId = targetInput?.replace(/[^0-9]/g, ''); // Extrair apenas números (caso seja menção)
        const member = targetId
            ? await guild.members.fetch(targetId).catch(() => null)
            : guild.members.cache.find(m =>
                m.user.tag === targetInput || m.user.username === targetInput);

        if (!member) {
            const replyMessage = ':x: Usuário não encontrado.';
            return isInteraction
                ? context.reply({ content: replyMessage, ephemeral: true })
                : context.channel.send(replyMessage);
        }

        try {
            // Adiciona o cargo de softlock ao usuário
            await member.roles.add(softlockRole);

            // Salva o usuário no banco de dados
            const existingRecord = await SoftLock.findOne({ guildId: guild.id, userId: member.id });
            if (!existingRecord) {
                await SoftLock.create({ guildId: guild.id, userId: member.id });
            }

            const successMessage = `✅ Usuário ${member.user.tag || targetId} foi softlockado. Motivo: ${reason}`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: false })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[SoftLock Command] Erro ao aplicar softlock:', error);
            const errorMessage = ':x: Ocorreu um erro ao tentar aplicar o softlock.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};