const dotenv = require("dotenv").config();
const fetch = require("node-fetch");
const Discord = require("discord.js");
const client = new Discord.Client();

const createQuestionSession = async (msg, questionSession) => {
  return new Promise((resolve, reject) => {
    const { question, correct_answer, incorrect_answers } = questionSession;
    msg.channel.send(String(question));
    msg.channel.send(String(incorrect_answers));

    client.on("message", async (msg) => {
      if (msg.content === correct_answer) {
        if (msg.author.bot) {
        } else {
          msg.channel.send("Correct!");
          return resolve("Done");
        }
      }
    });
  });
};

const handleInput = async (msg, message) => {
  return new Promise(async (resolve, reject) => {
    let reply = "Done!";
    await fetch("https://opentdb.com/api.php?amount=2&category=11")
      .then((res) => {
        return res.json();
      })
      .then(async (data) => {
        console.log(data.results);

        const starterPromise = Promise.resolve(null);
        const log = (result) => console.log(result);
        const sessionComplete = await data.results.reduce(
          (p, question) =>
            p.then(() =>
              createQuestionSession(msg, question).then("Done", log)
            ),
          starterPromise
        );
        if (sessionComplete) {
          return resolve("Done!");
        }
      });
  });
};

client.on("ready", () => {
  console.log(`${client.user.tag} is ready`);
});

client.on("message", async (msg) => {
  if (msg.author.bot) return;
  if (msg.content === "/start") {
    const reply = await handleInput(msg, msg.content);
    msg.channel.send(reply);
  }
});

client.login(process.env.TOKEN);