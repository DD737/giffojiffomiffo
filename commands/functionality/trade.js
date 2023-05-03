const { SlashCommandBuilder, ChatInputCommandInteraction, User, Client } = require("discord.js");
const path = require('path');
const fs = require('fs');
const { off } = require("process");

const ilib = {
    coin: require('./coin').lib,
}

const lib = {

    /**
     * 
     * @param {User} arg_author 
     * @param {User} arg_user 
     * @param {string} arg_ownItem 
     * @param {string} arg_othersItem
     * @param {ChatInputCommandInteraction} interaction
     * @param {string} COIN
     */
    trade_offer: async (arg_author, arg_user, arg_ownItem, arg_othersItem, interaction, COIN) =>
    {

        const author = ilib.coin.get_user(arg_author);
        const user = ilib.coin.get_user(arg_user);

        const ownItem = ilib.coin.user_get_item(author, arg_ownItem);
        const othersItem = ilib.coin.user_get_item(user, arg_othersItem);

        if(!ownItem)
            throw `Cannot trade since you do not posess '${arg_ownItem}'!`;
        else if(!othersItem)
            throw `Cannot trade since the other person does not posess '${arg_othersItem}'!`;

        let json = new ilib.coin.classes.trade_json();lib._trade_start();

        /** @type {ilib.coin.classes.trade_json_trade} */
        let trade = new ilib.coin.classes.trade_json_trade();
        trade.id = interaction.id;
        trade.from = arg_author.id;
        trade.to = arg_user.id;
        trade.give = ownItem.name;
        trade.get = othersItem.name;

        if(json.offers.find(o => ( o.from == trade.from && o.to == trade.to && o.give == trade.give && o.get == trade.get )))
            throw `That trade already exists!`;

        json.offers.push(trade);
        lib._trade_end(json, true);

        const member = await interaction.guild.members.fetch(arg_author);
        const nickname = member.displayName;

        const itemLine = item => `${item.name} [${item.price} ${COIN}] (${item.count}) \n\t ${item.description}`;

        await arg_user.send(`${nickname} requested a trade with you on '${interaction.guild.name}'!\nThe trade id is '${interaction.id}'. Use it together with the trade command to accept/reject!\nOffer:\nYou get: \n${itemLine(ownItem)} \nYou lose: \n${itemLine(othersItem)}`);

    },

    /**
     * 
     * @param {string} arg_id 
     * @param {string} arg_reaction 
     * @param {ChatInputCommandInteraction} interaction
     */
    trade_react: async (arg_id, arg_reaction, interaction) => {

        let json = lib._trade_start();

        const trade = json.offers.find(trade => trade.id === arg_id);

        if(!trade)
            throw `Could not find trade offer with id '${arg_id}'!`;

        const giving = ilib.coin.get_user_id(trade.from);
        const getting = ilib.coin.get_user_id(trade.to);

        const giveItem = ilib.coin.user_get_item(giving, trade.give);
        const getItem = ilib.coin.user_get_item(getting, trade.get);

        if(!giveItem || !getItem)
            throw `Cannot complete trade! Someone doesn't posess the required item!`;

        const giver = await interaction.client.users.fetch(trade.from);
        const getter = await interaction.client.users.fetch(trade.to);

        if(arg_reaction === '1')
        {

            ilib.coin.user_rmv_item(giving, giveItem);
            ilib.coin.user_add_item(getting, giveItem);

            ilib.coin.user_rmv_item(getting, getItem);
            ilib.coin.user_add_item(giving, getItem);

            ilib.coin.update_user(giving);
            ilib.coin.update_user(getting);

            await giver.send(`${getter.username} accepted your trade!\nYou got ${getItem.name} for ${giveItem.name}!`);

        }
        else
            await giver.send(`${getter.username} rejected your trade.\nYou offered ${giveItem.name} for ${getItem.name}`);

        json.offers = json.offers.filter(offer => offer.id !== arg_id);

        lib._trade_end(json, true);

    },

    _trade_start: () => {

        const json_path = path.join(__dirname, '../../save/trade.json')

        /** @type {ilib.coin.classes.trade_json} */
        const json = JSON.parse(fs.readFileSync(json_path));

        return json;

    },
    /**
     * 
     * @param {ilib.coin.classes.trade_json} json 
     * @param {boolean} writeJson 
     * @returns 
     */
    _trade_end: (json, writeJson) => {

        const json_path = path.join(__dirname, '../../save/trade.json')

        if(writeJson)
            fs.writeFileSync(json_path, JSON.stringify(json));

    },

}

module.exports = {

    lib,

    data: new SlashCommandBuilder()
        .setName('trade')
        .setDescription('asdf')
        .addSubcommand(cmd => // offer
            cmd.setName('offer')
                .setDescription('asdf')
                .addUserOption(opt =>
                    opt.setName('user')
                        .setDescription('asdf')
                        .setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName('own_item')
                        .setDescription('asdf') 
                        .setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName('others_item')
                        .setDescription('asdf') 
                        .setRequired(true)
                )
        )
        .addSubcommand(cmd => // react
            cmd.setName('react')
                .setDescription('asdf')
                .addStringOption(opt =>
                    opt.setName('id')
                        .setDescription('asdf')
                        .setRequired(true)
                )
                .addStringOption(opt =>
                    opt.setName('reaction') 
                        .setDescription('asdf')
                        .addChoices(
                            { name: 'accept', value: '1' },
                            { name: 'reject', value: '0' },
                        )
                        .setRequired(true)
                )
        )
        ,
    /** @param {ChatInputCommandInteraction} [interaction] */
    async execute(interaction)
    {
        
        const cmd = interaction.options.getSubcommand(true);

        const COIN = ilib.coin.COIN(interaction.client);

        switch(cmd)
        {

            case 'offer':
            {

                const arg_user = interaction.options.getUser('user', true);
                const arg_ownItem = interaction.options.getString('own_item', true);
                const arg_othersItem = interaction.options.getString('others_item', true);
                
                try
                {
                    await lib.trade_offer(interaction.user, arg_user, arg_ownItem, arg_othersItem, interaction, COIN);
                    await interaction.reply(`Successfully requested the trade!`);
                }
                catch(e)
                {
                    await interaction.reply(e+'');
                    break;
                }

                break;

            }
            case 'react':
            {

                const arg_id = interaction.options.getString('id', true);
                const arg_reaction = interaction.options.getString('reaction', true);

                try
                {
                    await lib.trade_react(arg_id, arg_reaction, interaction);
                    await interaction.reply(`Successfully ${ arg_reaction === '1' ? 'accepted' : 'rejected' } the trade!`);
                }
                catch(e)
                {
                    await interaction.reply(e+'');
                    break;
                }

                break;

            }

        }

    }

}
