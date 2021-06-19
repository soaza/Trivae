const dotenv = require("dotenv").config();
const fetch = require("node-fetch");
const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
  console.log(`${client.user.tag} is ready`);
});

client.on("message", async (msg) => {
  if (msg.author.bot) return;
});

client.login(process.env.TOKEN);
