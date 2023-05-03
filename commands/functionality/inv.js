const { SlashCommandBuilder, ChatInputCommandInteraction } = require("discord.js");
const path = require('path');
const fs = require('fs');

const ilib = {

    coin: (require('./coin').lib),

}
const lib = {

    /** @param {ilib.coin.classes.coin_json_user} [arg_user] */
    inv_list: (arg_user) => {

        const user = ilib.coin.get_user(arg_user);

        return user.items;

    },
    /**
     * @param {ilib.coin.classes.coin_json_user} [arg_user_1]
     * @param {ilib.coin.classes.coin_json_user} [arg_user_2]
     * @param {string} [arg_item]
     * @param {ChatInputCommandInteraction} [interaction]
     */
    inv_transfer: async (arg_user_1, arg_user_2, arg_item, interaction) => {

        const user_1 = ilib.coin.get_user(arg_user_1);
        const user_2 = ilib.coin.get_user(arg_user_2);
        
        const member_1 = await interaction.guild.members.fetch(arg_user_1);
        const nickname_1 = member_1.displayName;

        const item = ilib.coin.user_get_item(user_1, arg_item);

        if(!item)
            throw `The user ${nickname_1} does not posess the item '${arg_item}'!`;

        ilib.coin.user_rmv_item(user_1, item);
        ilib.coin.user_add_item(user_2, item);

        ilib.coin.update_user(user_1);
        ilib.coin.update_user(user_2);

        return item;

    },

}

module.exports = {

    lib,
    data: new SlashCommandBuilder()
        .setName('inv')
        .setDescription('asdf')
        .addSubcommand(cmd => // list
            cmd.setName('list')
                .setDescription('asdf')
                .addUserOption(opt =>
                    opt.setName('user')
                        .setDescription('asdf')
                        .setRequired(true)
                )
        )
        .addSubcommand(cmd => // transfer
            cmd.setName('transfer')
                .setDescription('asdf')
                .addUserOption(opt =>
                    opt.setName('from')
                        .setDescription('asdf')
                        .setRequired(true)
                )
                .addUserOption(opt =>
                    opt.setName('to')
                        .setDescription('asdf')
                        .setRequired(true)
                )
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

                const arg_user = interaction.options.getUser('user', true);

                const items = lib.inv_list(arg_user);

                const member = await interaction.guild.members.fetch(arg_user);
                const nickname = member.displayName;

                if(items.length < 1)
                {
                    await interaction.reply(`The user ${nickname} has no items yet.`);
                    break;
                }

                let msg = `The user ${nickname} has the following items:`

                for(const item of items)
                    msg += `\n- ${itemLine(item)}`;

                await interaction.reply(msg);

                break;

            }
            case 'transfer':
            {

                if(!(await interaction.guild.members.fetch(interaction.user)).roles.cache.some(role => role.id === '1096986645976338535')) // bank role
                {
                    await interaction.reply(`You don't have permission to use this command!`);
                    break;
                }

                const arg_user_1 = interaction.options.getUser('from');
                const arg_user_2 = interaction.options.getUser('to');
                const arg_item = interaction.options.getString('item');
        
                const member_1 = await interaction.guild.members.fetch(arg_user_1);
                const nickname_1 = member_1.displayName;
        
                const member_2 = await interaction.guild.members.fetch(arg_user_2);
                const nickname_2 = member_2.displayName;

                try 
                {
                    const item = await lib.inv_transfer(arg_user_1, arg_user_2, arg_item, interaction);
                    await interaction.reply(`Successfully transfered the item ${item.name} from ${nickname_1} to ${nickname_2}!`);
                }
                catch (e)
                {
                    await interaction.reply(e + 'asdf');
                    break;
                }

                break;

            }

        }

    }

}
