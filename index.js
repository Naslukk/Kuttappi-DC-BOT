require('dotenv').config();
const express = require('express');


const app = express();
const port = 3000; 


app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});
const token = process.env.BOT_TOKEN ;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', member => {
    const role = member.guild.roles.cache.find(role => role.name === "⭐︱Student");
    if (role) {
        member.roles.add(role)
            .then(() => console.log(`Assigned the role ${role.name} to ${member.user.tag}.`))
            .catch(err => console.error(err));
    } else {
        console.log('Role not found');
    }
});

client.login(token);
