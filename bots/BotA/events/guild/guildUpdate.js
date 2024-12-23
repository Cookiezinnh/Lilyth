const { EmbedBuilder } = require('discord.js');
const emojis = require('../../../../shared/emojis');
const channels = require('../../../../shared/channels');

module.exports = async (client, oldGuild, newGuild) => {
  try {
    const changes = [];

    // Verifica e registra mudanças no nome do servidor
    if (oldGuild.name !== newGuild.name) {
      changes.push({
        name: `${emojis.edit} Nome do Servidor`,
        value: `**De:** ${oldGuild.name}\n**Para:** ${newGuild.name}`,
        inline: false
      });
    }

    // Verifica e registra mudanças no ícone do servidor
    if (oldGuild.iconURL() !== newGuild.iconURL()) {
      changes.push({
        name: `${emojis.image} Ícone do Servidor`,
        value: `**De:** [Ícone Antigo](${oldGuild.iconURL() || 'Nenhum'})\n**Para:** [Novo Ícone](${newGuild.iconURL() || 'Nenhum'})`,
        inline: false
      });
    }

    // Verifica e registra mudanças na região do servidor
    if (oldGuild.region !== newGuild.region) {
      changes.push({
        name: `${emojis.region} Região do Servidor`,
        value: `**De:** ${oldGuild.region || 'Não Definida'}\n**Para:** ${newGuild.region || 'Não Definida'}`,
        inline: false
      });
    }

    // Verifica mudanças no sistema de verificação
    if (oldGuild.verificationLevel !== newGuild.verificationLevel) {
      changes.push({
        name: `${emojis.security} Nível de Verificação`,
        value: `**De:** ${oldGuild.verificationLevel}\n**Para:** ${newGuild.verificationLevel}`,
        inline: false
      });
    }

    // Verifica e registra mudanças no sistema de moderação
    if (oldGuild.systemChannelId !== newGuild.systemChannelId) {
      const oldSystemChannel = oldGuild.systemChannel ? `<#${oldGuild.systemChannelId}>` : 'Nenhum';
      const newSystemChannel = newGuild.systemChannel ? `<#${newGuild.systemChannelId}>` : 'Nenhum';
      changes.push({
        name: `${emojis.channel} Canal de Sistema`,
        value: `**De:** ${oldSystemChannel}\n**Para:** ${newSystemChannel}`,
        inline: false
      });
    }

    // Se não houver alterações, interrompe o processo
    if (changes.length === 0) return;

    // Criar o embed com as mudanças
    const embed = new EmbedBuilder()
      .setTitle(`${emojis.dwhite} Atualização no Servidor`)
      .setDescription(
        `**${emojis.guild} Servidor Atualizado**: ${newGuild.name}\n` +
        `**${emojis.id} ID do Servidor**: ${newGuild.id}\n\n` +
        `**${emojis.dgreen} __Alterações Detectadas__**:`
      )
      .addFields(changes)
      .setColor('#ffaa00')
      .setTimestamp()
      .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });

    // Buscar o canal de log configurado
    const logChannel = await client.channels.fetch(channels.SERVER_LOG);

    // Enviar o embed no canal de log, caso exista
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    } else {
      console.warn('🟥 | [guildUpdate] Canal de log não encontrado ou inválido.');
    }
  } catch (error) {
    console.error('⬛ | [guildUpdate] Erro ao processar atualização do servidor:', error);
  }
};