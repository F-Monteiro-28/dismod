const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  Client,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const ticketSchema = require("../../schemas/ticketSettings");
const i18next = require('i18next');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("A fully customisable tikcet system!")
    .addSubcommand((sub) =>
      sub
        .setName("setup")
        .setDescription("Setup the ticket system!")
        .addChannelOption((opt) =>
          opt
            .setName("category")
            .setDescription("The category in whcih tickets will be created.")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildCategory)
        )
        .addChannelOption((opt) =>
          opt
            .setName("logs")
            .setDescription(
              "The channel in which the tickets will be loggged with transcript."
            )
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addRoleOption((opt) =>
          opt
            .setName("manager")
            .setDescription("The role which can see the ticket channels")
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("send")
        .setDescription("Send the ticket message!")
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("The channel to send the embed in.")
            .setRequired(true)
            .addChannelTypes(
              ChannelType.GuildAnnouncement,
              ChannelType.GuildText
            )
        )
        .addStringOption((str) =>
          str
            .setName("message")
            .setDescription("The message to display in the embed.")
            .setRequired(true)
        )
        .addStringOption((str) =>
          str
            .setName("color")
            .setDescription("The embed color. IN HEX")
            .setMaxLength(6)
            .setMinLength(6)
        )
    )
    .addSubcommand((sub) =>
      sub.setName("disable").setDescription("Disable the ticket system.")
    )
    .addSubcommandGroup((sg) =>
      sg
        .setName("config")
        .setDescription("Config the ticket system.")
        .addSubcommand((sub) =>
          sub
            .setName("category")
            .setDescription("The ticket category")
            .addChannelOption((opt) =>
              opt
                .setName("category")
                .setDescription(
                  "The category in whcih tickets will be created."
                )
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildCategory)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("channel")
            .setDescription("The logs channel")
            .addChannelOption((opt) =>
              opt
                .setName("channel")
                .setDescription(
                  "The category in whcih tickets will be created."
                )
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
            )
        )
        .addSubcommand((sub) =>
          sub
            .setName("role")
            .setDescription("The ticket manager role")
            .addRoleOption((opt) =>
              opt
                .setName("manager")
                .setDescription("The role which can see the ticket channels")
                .setRequired(true)
            )
        )
    ),
  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   * @returns
   */
  async execute(interaction, client) {
    const embed = new EmbedBuilder();
    const { emojis, embedColor, errorColor, successColor } = client.config;
    const { guildId, options, member, guild } = interaction;
    const subCommand = options.getSubcommand();
    const subCommandGroup = options.getSubcommandGroup();
    const category = options.getChannel("category");
    const logs = options.getChannel("logs");
    const manager = options.getRole("manager");
    const channel = options.getChannel("channel");
    const message = options.getString("message");
    const color = options.getString("color") ?? embedColor;

    const guildLang = interaction.guild?.preferredLocale || 'en-US';
    i18next.changeLanguage(guildLang);

    if (!member.permissions.has(PermissionFlagsBits.Administrator)) {
      return await interaction.reply({
        embeds: [
          embed
            .setColor(errorColor)
            .setDescription(
              `${emojis.error} ${i18next.t("errors.permission_error")}`
            ),
        ],
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });
    const data = await ticketSchema.findOne({ GuildID: guildId });

    if (subCommandGroup) {
      if (!data)
        return await interaction.editReply(
          i18next.t("errors.ticket_system_not_setup")
        );

      switch (subCommand) {
        case "category":
          await ticketSchema.findOneAndUpdate(
            { GuildID: guildId },
            { CategoryID: category.id }
          );
          await interaction.editReply(
            i18next.t("success.ticket_category_updated", { category: `<#${category.id}>` })
          );
          break;

        case "channel":
          await ticketSchema.findOneAndUpdate(
            { GuildID: guildId },
            { TranscriptsID: channel.id }
          );
          await interaction.editReply(
            i18next.t("success.ticket_logs_channel_updated", { channel: `<#${channel.id}>` })
          );
          break;

        case "role":
          await ticketSchema.findOneAndUpdate(
            { GuildID: guildId },
            { ManagerRole: manager.id }
          );
          await interaction.editReply(
            i18next.t("success.ticket_managers_updated", { role: `<@&${manager.id}>` })
          );
          break;
        default:
          break;
      }
    } else {
      switch (subCommand) {
        case "disable":
          if (!data)
            return await interaction.editReply(
              i18next.t("errors.ticket_system_not_setup")
            );

          await ticketSchema.findOneAndDelete({ GuildID: guildId });
          await interaction.editReply(
            i18next.t("success.ticket_system_disabled")
          );
          break;

        case "send":
          if (!data)
            return await interaction.editReply(
              i18next.t("errors.ticket_system_not_setup")
            );
          embed.setColor(color).setDescription(`${message}`);

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("tickets")
              .setStyle(ButtonStyle.Primary)
              .setEmoji(emojis.ticket)
              .setLabel(i18next.t("commands.ticket.send.open_ticket_button"))
          );

          await channel.send({ embeds: [embed], components: [row] });
          await interaction.editReply(i18next.t("success.ticket_message_sent"));
          break;
        case "setup":
          if (data)
            return await interaction.editReply(
              i18next.t("errors.ticket_system_already_setup")
            );

          await ticketSchema.create({
            GuildID: guildId,
            CategoryID: category.id,
            TranscriptsID: logs.id,
            ManagerRole: manager.id,
          });
          embed
            .setColor(successColor)
            .setDescription(`${emojis.success} ${i18next.t("success.ticket_system_setup")}`)
            .addFields(
              {
                name: i18next.t("commands.ticket.setup.category_label"),
                value: `> \`${category.name}\``,
                inline: true,
              },
              {
                name: i18next.t("commands.ticket.setup.logs_label"),
                value: `> \`${logs.name}\``,
                inline: true,
              },
              { name: i18next.t("commands.ticket.setup.manager_label"), value: `> \`${manager.name}\`` }
            );

          await interaction.editReply({ embeds: [embed] });
          break;
        default:
          break;
      }
    }
  },
};
