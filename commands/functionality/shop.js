const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const path = require('path');
const fs = require('fs');

const ilib = {
    coin: (require('./coin.js').lib),
    inv : (require('./inv.js').lib),
}

const lib = {

    _shop_lib_start: () => {
        const json_path = path.join(__dirname, '../../save/shop.json')

        /** @type {ilib.coin.classes.shop_json} */
        const json = JSON.parse(fs.readFileSync(json_path));
        return json;
    },
    _shop_lib_end: (json, write) => {
        const json_path = path.join(__dirname, '../../save/shop.json')
        if(write)
            fs.writeFileSync(json_path, JSON.stringify(json));
    },

    items_list: () => {
        return module.exports.lib._shop_lib_start().items;
    },
    /**
     * @param {User} [arg_user]
     * @param {string} [arg_item]
     * @param {string} [COIN]
     */
    items_buy: async (arg_user, arg_item, COIN) => {

        let json = module.exports.lib._shop_lib_start();

        let item_index = -1;
        for(let i = 0; i < json.items.length; i++)
            if(json.items[i].name.toLowerCase() === arg_item.toLowerCase())
            {
                arg_item = json.items[i].name;
                item_index = i;
                break;
            }

        if(item_index < 0)
            throw (`The item '${arg_item}' does not exist!`);

        const user = ilib.coin.get_user(arg_user);
        const coins = user.coins;

        if(coins < json.items[item_index].price)
            throw (`The item '${arg_item}' costs ${json.items[item_index].price} ${COIN} but you only have ${coins} ${COIN}.`);

        user.coins -= json.items[item_index].price;

        let item;
        if((item = user.items.find(i => i.name.toLowerCase() === arg_item.toLowerCase())))
            item.count++;
        else
        {
            item = Object.assign({}, json.items[item_index]);
            item.count = 1;
            user.items.push(item);
        }

        json.items[item_index].count--;
        if(json.items[item_index].count < 1)
            json.items = json.items.filter((_, i) => i !== item_index);

        module.exports.lib._shop_lib_end(json, true);
        await ilib.coin.update_user(user);

        return item;

    },

}

module.exports = {
    
    lib,
    data: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Nervt einen Nutzer via DM!')
        .addSubcommand(cmd => 
            cmd.setName('list')
                .setDescription('asdf')
        )
        .addSubcommand(cmd =>
            cmd.setName('buy')
                .setDescription('asdf')
                .addStringOption(opt => 
                    opt.setName('item')
                        .setDescription('asdf')
                        .setRequired(true)
                )
        )
        ,
    /** @param {ChatInputCommandInteraction} [interaction] */
    async execute(interaction)
    {

        const cmd = interaction.options.getSubcommand();
        const COIN = ilib.coin.COIN(interaction.client);

        const itemLine = item => `${item.name} [${item.price} ${COIN}] (${item.count}) \n\t ${item.description}`;

        switch(cmd)
        {

            case 'list':
            {

                const items = module.exports.lib.items_list();

                if(items.length < 1)
                {
                    await interaction.reply(`Currently, there are no items in the shop!`);
                    break;
                }
                const getItemStr = (item) => {
                    return itemLine(item);
                }

                let msg = 'The following items are available:';

                for(const item of items)
                    msg += `\n- ` + getItemStr(item);

                await interaction.reply(msg);

                break;

            }
            case 'buy':
            {

                const user = interaction.user;

                const arg_item = interaction.options.getString('item', true);

                try
                {

                    const item = await module.exports.lib.items_buy(user, arg_item, COIN);

                    await interaction.reply(`Purchased the ${item.name} for ${item.price} ${COIN}!`);

                }
                catch(e)
                {
                    await interaction.reply(e + '');
                    break;
                }

                break;

            }

        }

    }

}
