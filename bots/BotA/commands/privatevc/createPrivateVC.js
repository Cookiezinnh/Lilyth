const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const PrivateVC = require('../../models/privateVoiceChannel.js');
const Categories = require('../../../../shared/categories.js');
const roles = require('../../../../shared/roles.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createprivatevc')
        .setDescription('Cria um canal de voz privado.')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Nome do canal de voz.')
                .setRequired(true)
        ),
    requiredRoles: [], // Nenhuma restrição de cargo
    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        let guild, member, inputName;

        if (isInteraction) {
            guild = context.guild;
            member = context.member;
            inputName = context.options.getString('name');
        } else {
            guild = context.guild;
            member = context.member || context.author; // Ajuste para comandos prefixados
            inputName = args.join(' ');
        }

        // Verifica se `member` é válido
        if (!member || !guild) {
            const errorMessage = '❌ Não foi possível identificar o usuário ou servidor.';
            if (isInteraction) {
                return context.reply({ content: errorMessage, ephemeral: true });
            } else {
                return context.channel.send(errorMessage);
            }
        }

        const channelName = `┗・🔊︰${member.user.username}'s (${inputName.slice(0, 20).replace(/[^a-zA-Z0-9 ]/g, '')})`;
        const categoryId = Categories.PRIVATE_VC_CATEGORY;

        // Verifica se o usuário já possui um canal privado
        const existingVC = await PrivateVC.findOne({ ownerId: member.id });
        if (existingVC) {
            const reply = '⚠️ Você já possui um canal privado ativo.';
            if (isInteraction) {
                return context.reply({ content: reply, ephemeral: true });
            } else {
                return context.channel.send(reply);
            }
        }

        try {
            // Cria o canal de voz privado
            const channel = await guild.channels.create({
                name: channelName,
                type: 2, // Tipo: canal de voz
                parent: categoryId, // Define a categoria correta
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id, // Todos os membros
                        deny: [PermissionFlagsBits.ViewChannel], // Bloqueia a visualização para todos
                    },
                    {
                        id: member.id, // Usuário que criou o canal
                        allow: [
                            PermissionFlagsBits.ViewChannel,         // Permissão para ver o canal
                            PermissionFlagsBits.Connect,            // Permissão para conectar
                            PermissionFlagsBits.Speak,              // Permissão para falar
                            PermissionFlagsBits.ManageChannels,     // Permissão para gerenciar o canal
                            PermissionFlagsBits.ManageRoles         // Permissão para gerenciar permissões
                        ],
                    },
                ],
            });

            // Salva as informações no banco de dados
            await PrivateVC.create({
                ownerId: member.id,
                voiceChannelId: channel.id,
                guildId: guild.id,
                name: channelName
            });

            const successMessage = `✅ Canal de voz privado **${channelName}** criado com sucesso!`;
            if (isInteraction) {
                await context.reply({ content: successMessage, ephemeral: true });
            } else {
                await context.channel.send(successMessage);
            }
        } catch (error) {
            console.error('[CreatePrivateVC] Erro ao criar canal:', error);
            const errorMessage = '❌ Ocorreu um erro ao criar seu canal privado.';
            if (isInteraction) {
                await context.reply({ content: errorMessage, ephemeral: true });
            } else {
                await context.channel.send(errorMessage);
            }
        }
    },
};