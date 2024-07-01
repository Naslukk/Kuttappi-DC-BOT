const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});
const token = 'MTI1NjgxMjgzMzM1NDY4MjQ0OA.G7az5s.pO_JD3ZN9LB05Jx_KBpNFmCx9-mMEE7CdbOsb4';

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
