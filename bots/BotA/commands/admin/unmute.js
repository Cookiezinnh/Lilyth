const { SlashCommandBuilder } = require('discord.js');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Desmuta um usuário.')
        .addStringOption(option =>
            option.setName('usuario')
                .setDescription('Usuário ou ID do usuário a ser desmutado.')
                .setRequired(true)),
    requiredRoles: [roles.ADMIN, roles.MODERATOR],

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let targetInput, guild;

        if (isInteraction) {
            targetInput = context.options.getString('usuario');
            guild = context.guild;
        } else {
            targetInput = args[0];
            guild = context.guild;
        }

        // Obter o cargo "mutado"
        const muteRole = guild.roles.cache.get(roles.MUTED_ROLE);
        if (!muteRole) {
            const errorMessage = ':x: O cargo "Mutado" não foi encontrado.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        // Tentar obter o membro pelo ID, menção ou nome
        const targetId = targetInput?.replace(/[^0-9]/g, ''); // Extrair apenas números (caso seja menção)
        const member = targetId
            ? await guild.members.fetch(targetId).catch(() => null)
            : guild.members.cache.find(m =>
                m.user.tag === targetInput || m.user.username === targetInput);

        if (!member) {
            const errorMessage = ':x: Usuário não encontrado.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        try {
            // Remover o cargo "mutado" do usuário
            await member.roles.remove(muteRole);
            const successMessage = `✅ Usuário ${member.user.tag || targetId} foi desmutado.`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: false })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[Unmute Command] Erro ao desmutar o usuário:', error);
            const errorMessage = ':x: Ocorreu um erro ao tentar desmutar o usuário.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};