require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, InteractionType } = require('discord.js');


const app = express();
const port = 3000;


const guildId = '1165642036054065233';
const scheduleChannelId = '1257567796792135740';
const roleId = '1257257817006673940';
const studentsCountChannelId = '1258314381289193582';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});
const token = process.env.BOT_TOKEN;

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const commands = [
        new SlashCommandBuilder()
            .setName('have-doubt')
            .setDescription('Schedule a doubt clearing session')
    ];

    await client.guilds.cache.get(guildId)?.commands.set(commands);
    updateStudentCountChannel()
    console.log('Slash commands registered!');

});

// !! function for counting students in server

async function updateStudentCountChannel(){
    try {
        const guild = await client.guilds.fetch(guildId);

        // Fetch all members to ensure they are cached
        await guild.members.fetch();

        const role = await guild.roles.fetch(roleId);
        const membersWithRole = role.members;
        const membersCount = membersWithRole.size
        const channel = await guild.channels.fetch(studentsCountChannelId);

        // Update the channel name with the count of members with the role
        await channel.setName(`⭐︱Student - ${membersCount}`);
        console.log(`channel name updated ⭐︱Student - ${membersCount}`);

    } catch (error) {
        console.error('Error fetching role or members:', error);
    }
}

client.on('guildMemberRemove', () => {
    updateStudentCountChannel();
});

// ?? Student Role adding

client.on('guildMemberAdd', member => {
    const role = member.guild.roles.cache.find(role => role.name === "⭐︱Student");
    if (role) {
        member.roles.add(role)
            .then(() => updateStudentCountChannel())
            .catch(err => console.error(err));
    
    } else {
        console.log('Role not found');
    }
});

// !! Doubt clearing session scheduling

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand() && interaction.commandName === 'have-doubt') {
        const modal = new ModalBuilder()
            .setCustomId('doubtModal')
            .setTitle('Schedule a Session');

        const dateInput = new TextInputBuilder()
            .setCustomId('sessionDate')
            .setLabel('Enter the date (DD-MM-YYYY)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const timeInput = new TextInputBuilder()
            .setCustomId('sessionTime')
            .setLabel('Enter the time (HH:MM)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const amPmInput = new TextInputBuilder()
            .setCustomId('sessionAmPm')
            .setLabel('AM/PM')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(dateInput),
            new ActionRowBuilder().addComponents(timeInput),
            new ActionRowBuilder().addComponents(amPmInput)
        );

        await interaction.showModal(modal);
    } else if (interaction.isModalSubmit() && interaction.customId === 'doubtModal') {
        const date = interaction.fields.getTextInputValue('sessionDate');
        const time = interaction.fields.getTextInputValue('sessionTime');
        const sessionAmPm = interaction.fields.getTextInputValue('sessionAmPm');

        const slotId = `Session-${Date.now()}`;

        const userName = interaction.user.username;

        const channel = client.channels.cache.get(scheduleChannelId);
        if (channel) {
            channel.send(`New Session Slot Requested by\n**User:** ${userName}\n**Date**: ${date}\n**Time**: ${time}${sessionAmPm}\n**Slot ID**: ${slotId}`);
        }

        await interaction.reply({
            content: `Session Slot Requested:\nDate: ${date}\nTime: ${time} ${sessionAmPm}\nSlot ID: ${slotId}\n Please do join the <#1257568372401373205> on sharp time`,
            ephemeral: true // This makes the message visible only to the user
        });

        // Delete the reply after 10 seconds
        setTimeout(async () => {
            try {
                await interaction.deleteReply();
            } catch (error) {
                console.error('Failed to delete the reply:', error);
            }
        }, 10000);;
    }
});

client.login(token);

app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
