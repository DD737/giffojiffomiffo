const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const path = require('path');
const fs = require('fs');
const coin = require('./coin').lib;

module.exports = {

    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('esfad'),
    /** @param {ChatInputCommandInteraction} [interaction] */
    async execute(interaction)
    {

        const COIN = coin.COIN(interaction.client);
        
        const now = interaction.createdTimestamp;
        const h1 = 1000 * 60 * 60;

        const user = coin.get_user(interaction.user);

        if(user.lastworked + h1 > now)
        {
            const minutes = Math.round((user.lastworked + h1 - now) / 1000 / 60);
            await interaction.reply(`Cannot work!\nYou're still working for ${minutes} minutes!`);
            return;
        }

        user.lastworked = now;

        const coins = 20 * (1 + 0.1 * (user.worklevel - 1));
        user.coins += coins;

        interaction.reply(`You are working and gaining ${coins} ${COIN}!\nYou now have ${user.coins} ${COIN}`);

        user.workxp += 20 * (1 + 0.1 * (user.worklevel - 1));
        if(user.workxp >= 100 * Math.pow(1.1, (user.worklevel - 1)))
        {
            user.worklevel++;
            user.workxp = 0;
            interaction.channel.send(`${interaction.user.toString()}, you leveled up! Your current work level is ${user.worklevel}!\nYou now gain ${20 * (1 + 0.1 * (user.worklevel - 1))} ${COIN} instead of ${coins} ${COIN}!`);
        }

        coin.update_user(user);

    }

}

