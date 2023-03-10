const fs = require('node:fs');
const path = require('path');
require('dotenv').config();
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const data = require('./id.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}
// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'There was an error while executing this command!',
      ephemeral: true,
    });
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot === true || message.channelId !== data.channels.open)
    return;

  // if (message.channelId === '1067378877246210079') {
  //   // ^^ the text channel Id
  //   const thread = message.channel.threads.cache.find(
  //     (x) => x.name === 'aodhan'
  //   );
  //   thread.send('thread found');
  // }

  //   const thread = message.channel.threads.cache.find((x) => x.name === 'aodhan');

  //   thread.send('thread found');
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
