const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const calculator = require('calculator')
const path = require('path');
const fs = require('fs');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('calc')
        .setDescription('asdf')
        .addStringOption(opt =>
            opt.setName('equation')
                .setDescription('asdf') 
                .setRequired(true)
        )
    ,
    /** @param {ChatInputCommandInteraction} [interaction] */
    async execute(interaction)
    {

        const equation = interaction.options.getString('equation', true);

        try
        {
            await interaction.reply(Number(calculator.func('f(idontthinkyoucanguessthat)='+equation)())+'');
        }
        catch(e)
        {
            await interaction.reply(`Could not solve the equation!`);
        }

    }

}

