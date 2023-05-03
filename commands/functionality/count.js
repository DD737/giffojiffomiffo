const discord = require("discord.js");
const { SlashCommandBuilder, ChatInputCommandInteraction } = discord;
const calculator = require('calculator');
const path = require('path');
const fs = require('fs');

class count_json_channel {

    /** @type {string} */
    guildId = ".";
    /** @type {string} */
    channelId = ".";
    /** @type {number} */
    state = 0;
    /** @type {string} */
    lastUser = ".";

}

class count_json {

    /** @type {count_json_channel[]} */
    channels = [];

}

const lib = {

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */
    list: async (interaction) => {

        const json = lib._count_start();
        let msg = "";
        
        for(const cchannel of json.channels)
        {
            try
            {
                const guild = await interaction.client.guilds.fetch(cchannel.guildId);
                const channel = await guild.channels.fetch(cchannel.channelId);
                msg += `${guild.toString()}: ${channel.toString()}\n`;
            }
            catch(e) {}
        }

        if(msg.length > 0)
            msg[msg.length - 1] = '\0'
        else
            msg = 'No counting channels registered yet!';

        return msg;

    },

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @param {import("discord.js").Channel} channel 
     * @param {boolean} is_counting_channel 
     */
    set: async (interaction, channel, is_counting_channel) => {
        
        let json = lib._count_start();

        let c = new count_json_channel();
        c.guildId = interaction.guild.id;
        c.channelId = channel.id;
        c.lastUser = interaction.client.user.id;

        const contained = json.channels.some(ch => (ch.guildId === c.guildId && ch.channelId === c.channelId))

        if(is_counting_channel)
        {
            if(!contained)
                json.channels.push(c);
        }
        else if(contained)
            json.channels = json.channels.filter(ch => !(ch.guildId === c.guildId && ch.channelId === c.channelId));
        else
            return;

        await lib._count_end(json, true);

    },

    _count_start: () => {

        const jsonPath = path.join(__dirname, "../../save/count.json");

        /** @type {count_json} */
        const json = JSON.parse(fs.readFileSync(jsonPath));

        return json;

    },
    /**
     * 
     * @param {count_json} json 
     * @param {boolean} writeJson 
     */
    _count_end: (json, writeJson) => {

        const jsonPath = path.join(__dirname, "../../save/count.json");

        if(writeJson)
            fs.writeFileSync(jsonPath, JSON.stringify(json));

    }

}

/**
 * 
 * @param {count_json_channel} channel 
 * @param {discord.Message} message 
 * @returns {boolean}
 */
function _validMessage(channel, message)
{

    isnumchar = (c) => {
        switch(c)
        {
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
            case '0':
                return true;
        }
        return false;
    }
    
    const tokens = [];

    for(let i = 0; i < message.content.length; i++)
    {

        let c = message.content[i];

        if(isnumchar(c))
        {
            let word = '';
            while(isnumchar(message.content[i]))
            {
                word += message.content[i];
                i++;
            }
            let num = parseFloat(word);
            let token = {};
            token.num = num;
            switch(message.content[i])
            {
                case '+':
                case '-':
                case '*':
                case '/':
                case '^':
                    break;
                default:
                    return false;
            }
            token.method = message.content[i];
            tokens.push(token);
        }

    }

}
/**
 * 
 * @param {count_json_channel} channel 
 * @param {discord.Message} message 
 * @returns {boolean}
 */
async function  validMessage(channel, message)
{

    /** @type {number} */
    let value;
    try
    {
        value = calculator.func('f(idontthinkyoucanguessthat) = ' + message.content)();
    }
    catch(e)
    {
        return false;
    }

    return Math.round(value) === (channel.state + 1);

}

module.exports = {

    /**
     * 
     * @param {discord.Message<true>} msg 
     */
    onmessage: async (msg) => {

        if(msg.author.id === msg.client.user.id)
            return;

        let json = lib._count_start();

        const channel = json.channels.find(channel => channel.channelId === msg.channel.id && channel.guildId === msg.guild.id);

        if(!channel)
            return;

        if(msg.author.id === channel.lastUser)
        {
            channel.state = 0;
            try
            {
                await msg.reply(`${msg.author.toString()}, you may not count twice in a row! We will now start back at **1**!`);
            }
            catch(e){}
            channel.lastUser = msg.client.user.id;
            await lib._count_end(json, true);
            return;
        }
            
        channel.lastUser = msg.author.id;

        if(await validMessage(channel, msg))
        {
            channel.state++;
            try
            {
                await msg.react('✅');
            }
            catch(e){}
        }
        else
        {
            channel.state = 0;
            try
            {
                await msg.reply(`${msg.author.toString()}, you somehow messed that shit up! It's not that hard tbh, let's start by **1** again...`);
                channel.lastUser = msg.client.user.id;
            }
            catch(e){}
        }

        await lib._count_end(json, true);

    },

    lib,

    data: new SlashCommandBuilder()
        .setName('count')
        .setDescription('asdf')
        .addSubcommand(cmd => // list
            cmd.setName('list')
                .setDescription('asdf')
        )
        .addSubcommand(cmd => // set
            cmd.setName('set')
                .setDescription('asdf')
                .addChannelOption(opt =>
                    opt.setName('channel')
                        .setDescription('asdf')
                        .setRequired(true)
                )
                .addBooleanOption(opt =>
                    opt.setName('is_counting_channel')
                        .setDescription('asdf')
                        .setRequired(true)
                )
        )
    ,

    /** @param {ChatInputCommandInteraction} [interaction] */
    async execute(interaction)
    {
        
        const cmd = interaction.options.getSubcommand();

        switch(cmd)
        {

            case "list":
            {

                const msg = await lib.list(interaction);

                await interaction.reply(msg);

                break;

            }
            case "set":
            {

                const member = await interaction.guild.members.fetch(interaction.user);

                if(!member.roles.cache.some(role => role.id === "1099507391554396191"))
                {
                    await interaction.reply(`You don't have permission for that command!`);
                    break;
                }

                const channel = interaction.options.getChannel('channel', true);
                const is_counting_channel = interaction.options.getBoolean('is_counting_channel', true);

                await lib.set(interaction, channel, is_counting_channel);

                await interaction.reply(`Successfully set the channel ${channel.toString()} to ${ is_counting_channel ? '' : ' not ' } be a counting channel!`);

            }

        }

    }

}

