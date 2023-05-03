const { Client, GatewayIntentBits } = require('discord.js');
const { existsSync } = require("fs");
require('dotenv/config');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.on('ready', () => {
    console.log('ready');
});

client.on('messageCreate', msg => {

    const mifcmd = "#mif ";
    if(msg.content.startsWith(mifcmd))
    {

        const name = msg.content.substring(mifcmd.length);
        const path = "images/" + name;

        if(existsSync(path))
            msg.reply({
                content: `Found '${name}'!`,
                files: [
                    {
                        attachment: "images/" + name,
                    }
                ],
            });
        else
            msg.reply(`Couldn't find '${name}' :(`);

    }

    if(msg.content.trim().toLowerCase() === 'lester')
    {
        msg.channel.send({
            content: '[LESTER]',
            files: [
                {
                    attachment: 'images/lester.jpg'
                }
            ]
        })
    }

});

client.login(process.env.TOKEN);
