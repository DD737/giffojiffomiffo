const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const path = require('path');
const fs = require('fs');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('list')
        .setDescription('Listet jedes bekannte Bild!'),
    /** @param {ChatInputCommandInteraction} [interaction] */
    async execute(interaction)
    {
        
        let reply = 'Die folgenden Bilder sind bekannt:';

        const imagesFolder = path.join(__dirname, '..', '..', 'images');
        const images = fs.readdirSync(imagesFolder);
        for(const image of images)
            reply += `\n-${path.basename(image, path.extname(image))}`;

        await interaction.reply(reply);

    }

}

