const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serveravatar')
        .setDescription('Envia o avatar do servidor.'),
    requiredRoles: [], // Nenhuma restrição de cargo
    async execute(interaction) {
        const guild = interaction.guild;

        // Verifica se o servidor tem avatar
        if (!guild.iconURL()) {
            return interaction.reply({ content: '❌ Este servidor não possui avatar.', ephemeral: true });
        }

        try {
            // Cria um AttachmentBuilder com a URL do avatar
            const avatarURL = guild.iconURL({ dynamic: true, size: 1024 });
            const avatarAttachment = new AttachmentBuilder(avatarURL, { name: 'server_avatar.png' });

            await interaction.reply({
                content: '🖼️ Avatar do servidor:',
                files: [avatarAttachment],
            });
        } catch (error) {
            console.error('[ServerAvatar] Erro ao obter o avatar do servidor:', error);
            await interaction.reply({ content: '❌ Ocorreu um erro ao tentar enviar o avatar do servidor.', ephemeral: true });
        }
    },
};