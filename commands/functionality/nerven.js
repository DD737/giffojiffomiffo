const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const path = require('path');
const fs = require('fs');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('nerven')
        .setDescription('Nervt einen Nutzer via DM!')
        .addUserOption(option =>
            option.setName('nutzer')
                .setDescription('Der zu nervende Nutzer')
                .setRequired(true)
        ),
    /** @param {ChatInputCommandInteraction} [interaction] */
    async execute(interaction)
    {

        const user = interaction.options.getUser('nutzer', true);

        const author = interaction.user.username;
        const server = interaction.guild.name;
        
        const member = await interaction.guild.members.fetch(user);
        const nickname = member.displayName;

        try 
        {
            await user.send(`${author} will das du deinen Arsch auf den Server ${server} schwingst!`);
        }
        catch(e)
        {
            await interaction.reply(`${nickname} konnte nicht genervt werden :(`);
            return;
        }
        await interaction.reply(`${nickname} wurde genervt!`);

    }

}
