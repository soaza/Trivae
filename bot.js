const he = require("he");
const dotenv = require("dotenv").config();
const fetch = require("node-fetch");
const Discord = require("discord.js");
const client = new Discord.Client();
const player = require("./player");

const parseHTML = (htmlStr) => {
  return he.decode(String(htmlStr));
};

const createQuestionSession = async (msg, questionSession, index) => {
  return new Promise((resolve, reject) => {
    const { question, correct_answer } = questionSession;
    msg.channel.send(`Question ${index + 1}.  ${parseHTML(question)}`);
    msg.channel.send(
      `*(Number of words: ${String(correct_answer).split(" ").length})*`
    );

    player.playerResponse(client, parseHTML(correct_answer), msg, resolve);
  });
};

const categories = [
  `Any`,
  `Books`,
  `Film`,
  `Music`,
  `Musical and Theatres`,
  `Television`,
  `Video Games`,
  `Board Games`,
  `Science and Nature`,
  `Computers`,
  `Math`,
  `Mythology`,
  `Sports`,
  `Geography`,
  `History`,
  `Politics`,
  `Art`,
  `Celebrities`,
  `Animals`,
  `Vehicles`,
  `Comics`,
  `Science:Gadgets`,
  `Anime and Manga`,
  `Cartoon and Animations`,
];

const makeCategoriesString = () => {
  let index = 1;
  let outputStr = "```";
  categories.map((category) => {
    outputStr += `${index}) ${category} \n`;
    index += 1;
  });
  outputStr += "```";
  return outputStr;
};

const getCategoryMap = (category) => {
  if (category === 1) return "";
  return category + 8;
};

const startGame = async (msg, category) => {
  return new Promise(async (resolve, reject) => {
    msg.channel.send(` You chose *${categories[category - 1]}*`);
    await fetch(
      `https://opentdb.com/api.php?amount=10&category=${getCategoryMap(
        category
      )}`
    )
      .then((res) => {
        return res.json();
      })
      .then(async (data) => {
        console.log(data.results);

        const starterPromise = Promise.resolve(null);
        const log = (result) => console.log(result);
        const sessionComplete = await data.results.reduce(
          (p, question, index) =>
            p.then(() =>
              createQuestionSession(msg, question, index).then("Done", log)
            ),
          starterPromise
        );
        if (sessionComplete) {
          return resolve(player.players);
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
    //   after the round
    msg.channel.send("Please choose a category");
    msg.channel.send(makeCategoriesString());
    client.on("message", async (msg) => {
      if (msg.author.bot) return;
      if (parseInt(String(msg.content)) < 25) {
        initialiseCategory(parseInt(String(msg.content)));
      }
    });

    const initialiseCategory = async (category) => {
      const scoreboard = await startGame(msg, category);
      let scoreboardReply = "```End of Round- \n ";
      for (var player of Object.keys(scoreboard)) {
        scoreboardReply += String(player + " : " + scoreboard[player] + "\n");
      }
      scoreboardReply += "```";
      msg.channel.send(scoreboardReply);
    };
  }
});

client.login(process.env.TOKEN);
