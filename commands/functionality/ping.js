const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const path = require('path');
const fs = require('fs');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pingt einen Nutzer!')
        .addUserOption(option =>
            option.setName('nutzer')
                .setDescription('Der zu pingende Nutzer')
                .setRequired(true)
        ),
    /** @param {ChatInputCommandInteraction} [interaction] */
    async execute(interaction)
    {

        const user = interaction.options.getUser('nutzer', true);

        await interaction.reply(`Hallo ${user.toString()}, wie geht's?\nIch wollte nur mal nachfragen...`);

    }

}
