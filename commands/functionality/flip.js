const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const path = require('path');
const fs = require('fs');
const coinLib = require('./coin.js').lib;

module.exports = {

    data: new SlashCommandBuilder()
        .setName('flip')
        .setDescription('Nervt einen Nutzer via DM!')
        .addNumberOption(opt =>
            opt.setName('amount')
                .setDescription('asdf')
                .setRequired(true)
        )
        ,
    /** @param {ChatInputCommandInteraction} [interaction] */
    async execute(interaction)
    {

        const author = interaction.user;

        const coins = coinLib.coin_get(author);
        const COIN = coinLib.COIN(interaction.client);

        const arg_amount = interaction.options.getNumber('amount');

        if(coins < arg_amount)
        {
            await interaction.reply(`Cannot bet ${arg_amount} ${COIN}, you only have ${coins} ${COIN}!`);
            return;
        }

        if(Math.random() >= 0.5)
        {
            const coins = await coinLib.coin_set(author, interaction.guild, arg_amount, true);
            await interaction.reply(`You won!\nYou now have ${coins} ${COIN}!`);
        }
        else
        {
            const coins = await coinLib.coin_set(author, interaction.guild, -arg_amount, true);
            await interaction.reply(`You lost :(\nYou now have ${coins} ${COIN}.`);
        }

    }

}
