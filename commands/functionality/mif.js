const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, ChatInputCommandInteraction } = require("discord.js");
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mif')
        .setDescription('Zeigt ein bekanntes Bild')
        .addStringOption(option =>
            option.setName('datei')
                .setDescription('Die Datei die gezeigt werden soll')
                .setRequired(true)
        ),
    /** @param {ChatInputCommandInteraction} [interaction] */
    async execute(interaction)
    {

        const search = interaction.options.getString('datei');
        const imagesFolder = path.join(__dirname, '..', '..', 'images');
        let fileName = '';

        const files = [];
        const images = fs.readdirSync(imagesFolder);
        for(const image of images)
        {
            files.push({
                name: path.basename(image, path.extname(image)),
                file: path.basename(image),
            });
        }

        for(const file of files)
        {
            if(file.name === path.basename(search, path.extname(search)))
            {
                fileName = file.file;
                break;
            }
        }

        if(fileName !== '')
        {

            await interaction.reply({
                content: `Found '${fileName}'!`,
                files: [
                    {
                        attachment: path.join(imagesFolder, fileName),
                    }
                ]
            });

        }
        else
            await interaction.reply(`Couldn't find anything for '${search}' :(`);

    }
}