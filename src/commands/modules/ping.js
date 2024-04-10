const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const i18next = require('i18next');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription("Check Dismod Ping"),
  
    async execute(interaction) {
      try {
        const guildLang = interaction.guild?.preferredLocale || 'en-US'; // Obtém o idioma preferido do servidor ou usa o inglês dos Estados Unidos como padrão
        i18next.changeLanguage(guildLang); // Define o idioma do i18next para o idioma preferido do servidor
    
        const embed = new EmbedBuilder()
          .setTitle(i18next.t('commands.ping.checking_ping'))
          .setDescription(i18next.t('commands.ping.loading'));
    
        const initialColor = '#3498db';
        embed.setColor(initialColor);
    
        const pingMessage = await interaction.reply({ embeds: [embed] });
    
        setTimeout(async () => {
          const latency = pingMessage.createdTimestamp - interaction.createdTimestamp;
          const apiLatency = interaction.client.ws.ping;
    
          const resultEmbed = new EmbedBuilder()
            .setTitle('Dismod');
    
          const resultColor = '#2ecc71';
          resultEmbed.setColor(resultColor);
    
          resultEmbed.addFields(
            { name: i18next.t('commands.ping.dismod_ping'), value: `${latency}ms`, inline: true },
            { name: i18next.t('commands.ping.api_ping'), value: `${apiLatency}ms`, inline: true }
          );
    
          await pingMessage.edit({ embeds: [resultEmbed] });
    
          setTimeout(async () => {
            await pingMessage.delete();
          }, 3000);
        }, 1000);
      } catch (error) {
        console.error(error);
      }
    },    
};
