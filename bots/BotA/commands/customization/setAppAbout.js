const { SlashCommandBuilder, ActivityType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setappabout')
        .setDescription('Define o status do bot.')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Tipo de atividade (Playing, Streaming, Listening, Watching, Competing, Custom).')
                .setRequired(true)
                .addChoices(
                    { name: 'Playing', value: 'playing' },
                    { name: 'Streaming', value: 'streaming' },
                    { name: 'Listening', value: 'listening' },
                    { name: 'Watching', value: 'watching' },
                    { name: 'Competing', value: 'competing' },
                    { name: 'Custom', value: 'custom' }
                )
        )
        .addStringOption(option =>
            option.setName('status')
                .setDescription('Texto que será exibido na atividade.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL para o Streaming (obrigatório para tipo "Streaming").')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Emoji personalizado para o status (obrigatório para tipo "Custom").')
                .setRequired(false)
        ),

    async execute(context, args) {
        const isInteraction = context.isCommand?.();
        const client = context.client;
        let activityType, statusText, url, emoji;

        if (isInteraction) {
            activityType = context.options.getString('type');
            statusText = context.options.getString('status');
            url = context.options.getString('url');
            emoji = context.options.getString('emoji');
        } else {
            // Para prefixo, "args" contém os argumentos do comando
            activityType = args[0]?.toLowerCase();
            statusText = args.slice(1).join(' ');

            // Se for tipo 'streaming', a URL deve ser o segundo argumento
            if (activityType === 'streaming') {
                url = args[1];
                statusText = args.slice(2).join(' ');
            } else if (activityType === 'custom') {
                emoji = args[1];
                statusText = args.slice(2).join(' ');
            }
        }

        if (!activityType || !statusText) {
            const errorMessage = '⚠️ Você precisa fornecer o tipo de atividade e o texto!';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        // Mapeando tipo de atividade para o formato correto com base no ActivityType
        const activityMap = {
            playing: ActivityType.Playing,
            streaming: ActivityType.Streaming,
            listening: ActivityType.Listening,
            watching: ActivityType.Watching,
            competing: ActivityType.Competing,
            custom: ActivityType.Custom,
        };

        const activity = activityMap[activityType];

        if (!activity) {
            const errorMessage = '⚠️ Tipo de atividade inválido! Use: Playing, Streaming, Listening, Watching, Competing, Custom.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        // Verifica se a URL é necessária para o tipo 'streaming'
        if (activityType === 'streaming' && !url) {
            const errorMessage = '⚠️ A URL é obrigatória para o tipo de atividade "Streaming".';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        // Verifica se o emoji é necessário para o tipo 'custom'
        if (activityType === 'custom' && !emoji) {
            const errorMessage = '⚠️ O emoji é obrigatório para o tipo de atividade "Custom".';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }

        try {
            // Para 'custom', passamos o emoji
            if (activityType === 'custom' && emoji) {
                await client.user.setActivity(statusText, { type: activity, name: statusText, emoji });
            } else {
                // Define o status do bot com base no tipo de atividade
                const activityOptions = { type: activity, name: statusText };

                // Para 'streaming', a URL deve ser passada
                if (activityType === 'streaming') {
                    activityOptions.url = url;
                }

                await client.user.setActivity(activityOptions);
            }

            const successMessage = `✅ Status do bot atualizado para: "${statusText}" (${activityType}).`;
            return isInteraction
                ? context.reply({ content: successMessage, ephemeral: false })
                : context.channel.send(successMessage);
        } catch (error) {
            console.error('[SetAppAbout] Erro ao definir o status:', error);

            const errorMessage = '❌ Não foi possível definir o status.';
            return isInteraction
                ? context.reply({ content: errorMessage, ephemeral: true })
                : context.channel.send(errorMessage);
        }
    },
};