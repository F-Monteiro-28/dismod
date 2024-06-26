require("dotenv/config");
require("colors");

const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { readdirSync } = require("fs");

const client = new Client({
  intents: 32767,
});
client.commands = new Map();
client.buttons = new Map();
client.config = require("./config.js");

const handlerFolder = readdirSync("./src/handlers").filter((f) =>
  f.endsWith(".js")
);
for (const handler of handlerFolder) {
  const handlerFile = require(`./handlers/${handler}`);
  handlerFile(client);
}

client.login(process.env.Token);
