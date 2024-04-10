const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Deletes a specific number of messages.')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete.')
        .setRequired(true)),

  async execute(interaction) {
    try {
      const quantidade = interaction.options.getInteger('amount');

      if (quantidade < 1 || quantidade > 100) {
        return await interaction.reply({
          content: 'The quantity must be between 1 and 100.',
          ephemeral: true,
        });
      }
      const messages = await interaction.channel.bulkDelete(quantidade, true);

      const successColor = '#2ecc71';
      const errorColor = '#e74c3c';


      const embed = new EmbedBuilder()
        .setTitle(`${messages.size} messages were deleted.`)
        .setColor(messages.size > 0 ? successColor : errorColor);

      const reply = await interaction.reply({ embeds: [embed], ephemeral: true });

      setTimeout(() => {
        reply.delete();
      }, 2500);
    } catch (error) {
      console.error(error);
    }
  },
};
