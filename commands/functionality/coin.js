const { SlashCommandBuilder, ChatInputCommandInteraction, User, Guild, Client } = require("discord.js");
const path = require('path');
const fs = require('fs');
require('dotenv/config');

class coin_json_user_item
{
    /** @type {string} */
    name = '';
    /** @type {string} */
    description = '';
    /** @type {number} */
    price = 0;
    /** @type {number} */
    count = 0;
}
class coin_json_user
{
    /** @type {string} */
    id = '.';
    /** @type {number} */
    coins = 0;
    /** @type {number} */
    lastworked = 0;
    /** @type {number} */
    worklevel = 1;
    /** @type {number} */
    workxp = 0;
    /** @type {coin_json_user_item[]} */
    items = [];

    /**
     * @param {string} [id]
     * @param {number} [coins]
     */
    constructor(id, coins)
    {
        this.id = id;
        this.coins = coins;
    }
}
class coin_json
{
    /** @type {coin_json_user[]} */
    users = []
}

class shop_json
{
    /** @type {coin_json_user_item[]} */
    items = [];
}

class trade_json_trade
{
    /** @type {string} */
    id = '.';
    /** @type {string} */
    from = '.';
    /** @type {string} */
    to =   '.';
    /** @type {string} */
    give = '.';
    /** @type {string} */
    get =  '.';
}
class trade_json 
{
    /** @type {trade_json_trade[]} */
    offers = [];
}

const lib = {

    classes: {

        coin_json_user_item,
        coin_json_user,
        coin_json,
        shop_json,
        trade_json_trade,
        trade_json,
        
    },

    _coin_lib_start: () => {
        const json_path = path.join(__dirname, '../../save/users.json')

        /** @type {coin_json} */
        const json = JSON.parse(fs.readFileSync(json_path));
        return json;
    },
    _coin_lib_end: (json, write) => {
        const json_path = path.join(__dirname, '../../save/users.json')
        if(write)
            fs.writeFileSync(json_path, JSON.stringify(json));
    },

    /** @param {User}  [arg_user] */
    get_user: (arg_user) => lib.get_user_id(arg_user.id),
    /** @param {User}  [arg_id] */
    get_user_id: (arg_id) => {

        let json = lib._coin_lib_start();
        let write_json = false;

        let user_entry = -1;

        for(let i = 0; i < json.users.length; i++)
            if(json.users[i].id === arg_id)
            {
                user_entry = i;
                break;
            }

        if(user_entry < 0)
        {
            user_entry = json.users.length;
            json.users.push( new coin_json_user(arg_id, 0) );
            write_json = true;
        }

        lib._coin_lib_end(json, write_json);

        return json.users[user_entry];

    },
    /** @param {coin_json_user} [user] */
    update_user: async (user) => {

        let id = -1;

        let json = lib._coin_lib_start();

        for(let i = 0; i < json.users.length; i++)
            if(json.users[i].id === user.id)
            {
                id = i;
                break;
            }

        if(id < 0)
            json.users.push(user);
        else
            json.users[id] = user;

        await lib._coin_lib_end(json, true);

    },
    /** 
     * @param {coin_json_user} [user]
     * @param {string} [name] 
     */
    user_get_item: (user, name) =>
    {
        for(const item of user.items)
            if(item.name.toLowerCase() === name.toLowerCase())
                return item;
        return undefined;
    },
    /** 
     * @param {coin_json_user} [user]
     * @param {coin_json_user_item} [item] 
     */
    user_add_item: (user, item) =>
    {

        const user_item = lib.user_get_item(user, item.name);

        if(user_item)
            user_item.count++;
        else
            user.items.push(item);

    },
    /** 
     * @param {coin_json_user} [user]
     * @param {coin_json_user_item} [item] 
     */
    user_rmv_item: (user, item) =>
    {

        const user_item = lib.user_get_item(user, item.name);

        if(!user_item)
            return;

        if(user_item.count > 1)
        {
            user_item.count--;
            return;
        }

        user.items = user.items.filter(asdf => asdf.name.toLowerCase() !== item.name.toLowerCase());

    },

    /** @param {User}  [arg_user] */
    coin_get: (arg_user) => {

        let json = lib._coin_lib_start();
        let write_json = false;

        let user_entry = -1;

        for(let i = 0; i < json.users.length; i++)
            if(json.users[i].id === arg_user.id)
            {
                user_entry = i;
                break;
            }

        if(user_entry < 0)
        {
            user_entry = json.users.length;
            json.users.push( new coin_json_user(arg_user.id, 0) );
            write_json = true;
        }

        lib._coin_lib_end(json, write_json);

        return json.users[user_entry].coins;

    },
    /** 
     *  @param {User}  [arg_user] 
     *  @param {Guild} [guild] 
     */
    coin_set: async (arg_user, guild, arg_amount=0, cmd_add=false) => {

        let json = lib._coin_lib_start();

        let user_entry = -1;

        for(let i = 0; i < json.users.length; i++)
            if(json.users[i].id === arg_user.id)
            {
                user_entry = i;
                break;
            }

        let coinamount = arg_amount;

        if(user_entry > -1)
        {
            if(cmd_add)
                coinamount = (json.users[user_entry].coins += arg_amount);
            else
                coinamount = (json.users[user_entry].coins = arg_amount);
        }
        else
        {
            user_entry = json.users.length;
            json.users.push( new coin_json_user(arg_user.id, arg_amount) );
        }

        lib._coin_lib_end(json, true);

        return coinamount;

    },

    /** @param {Client} [client] */
    COIN: (client) => {
        let coin = client.emojis.cache.find(emoji => emoji.name === process.env.COIN_EMOJI_NAME);
        return (coin ? coin : 'coins')
    }

}

module.exports = {
    lib,

    data: new SlashCommandBuilder()
        .setName('coin')
        .setDescription('bameninghong')
        .addSubcommand(cmd => 
            cmd.setName('get')
                .setDescription('asdf')
                .addUserOption(opt => 
                    opt.setName('user')
                        .setDescription('asdf')
                        .setRequired(true)
                )
        )
        .addSubcommand(cmd => 
            cmd.setName('add')
                .setDescription('asdf')
                .addUserOption(opt => 
                    opt.setName('user')
                        .setDescription('asdf')
                        .setRequired(true)
                )
                .addNumberOption(opt =>
                    opt.setName('amount')
                        .setDescription('asdf')
                        .setRequired(true)
                )
        )
        .addSubcommand(cmd => 
            cmd.setName('sub')
                .setDescription('asdf')
                .addUserOption(opt => 
                    opt.setName('user')
                        .setDescription('asdf')
                        .setRequired(true)
                )
                .addNumberOption(opt =>
                    opt.setName('amount')
                        .setDescription('asdf')
                        .setRequired(true)
                )
        )
        .addSubcommand(cmd => 
            cmd.setName('set')
                .setDescription('asdf')
                .addUserOption(opt => 
                    opt.setName('user')
                        .setDescription('asdf')
                        .setRequired(true)
                )
                .addNumberOption(opt =>
                    opt.setName('amount')
                        .setDescription('asdf')
                        .setRequired(true)
                )
        ),
    /** @param {ChatInputCommandInteraction} [interaction] */
    async execute(interaction)
    {

        const COIN = lib.COIN(interaction.client);

        const cmd = interaction.options.getSubcommand();
        switch(cmd)
        {

            case 'get':
            {
                const arg_user = interaction.options.getUser('user', true);
                
                const coins = lib.coin_get(arg_user);

                const member = await interaction.guild.members.fetch(arg_user);
                const nickname = member.displayName;

                await interaction.reply(`The user ${nickname} has ${coins} ${COIN}!`);

                break;
            }
            case 'add':
            case 'sub':
            case 'set':
            {

                const author = interaction.user;

                if(!(await interaction.guild.members.fetch(author)).roles.cache.some(role => role.id === '1096986645976338535')) // bank role
                {
                    await interaction.reply(`You don't have permission to use this command!`);
                    break;
                }

                const arg_user = interaction.options.getUser('user', true);
                const arg_amount = interaction.options.getNumber('amount', true) * (cmd === 'sub' ? -1 : 1);

                const coinamount = await lib.coin_set(arg_user, interaction.guild, arg_amount, cmd !== 'set');

                const member = await interaction.guild.members.fetch(arg_user);
                const nickname = member.displayName;

                await interaction.reply(`${nickname} now has ${coinamount} ${COIN}!`);

                break;

            }

        }

    }

}
