const he = require("he");
const dotenv = require("dotenv").config();
const fetch = require("node-fetch");
const Discord = require("discord.js");

const startBot = () => {

  let client = new Discord.Client();
  const player = require("./player");

  intervals = []
  let gameStarted = false;

  const parseHTML = (htmlStr) => {
    return he.decode(String(htmlStr));
  };

  const createQuestionSession = async (msg, questionSession, index) => {
    return new Promise((resolve, reject) => {
      const {
        question,
        correct_answer
      } = questionSession;
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

  const getDifficultyMap = (difficulty) => {
    if (difficulty === 1) {
      return ''
    }
    const difficulties = ['easy', 'medium', 'hard']
    return difficulties[difficulty - 2]
  }

  const startGame = async (msg, category, difficulty) => {
    return new Promise(async (resolve, reject) => {
      msg.channel.send(` You chose *${categories[category - 1]}*`);
      await fetch(
          `https://opentdb.com/api.php?amount=10&category=${getCategoryMap(
        category
      )}&difficulty=${getDifficultyMap(difficulty)}`
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
      msg.channel.send("Please choose a category");
      msg.channel.send(makeCategoriesString());
      client.on("message", async (msg) => {
        if (msg.author.bot) return;
        if (parseInt(String(msg.content)) < 25 && !gameStarted) {
          gameStarted = true;
          const categoryNum = parseInt(String(msg.content))

          const filter = m => parseInt(m.content) < 4;
          msg.channel.send('```Please choose a difficulty:\n 1)All \n 2)Easy \n 3)Medium \n 4)Hard```').then(() => {
            msg.channel.awaitMessages(filter, {
                max: 1,
                time: 30000,
                errors: ['time']
              })
              .then(message => {
                const difficulty = message.first().content
                initialiseCategory(categoryNum, difficulty);
              })
              .catch(err => {
                msg.channel.send('Timeout');
              });
          })
        }
      });

      const initialiseCategory = async (category, difficulty) => {
        //   after the round

        const scoreboard = await startGame(msg, category, difficulty);
        let scoreboardReply = "```End of Round \n ";
        for (var player of Object.keys(scoreboard)) {
          scoreboardReply += String(player + " : " + scoreboard[player] + "\n");
        }
        scoreboardReply += "```";
        msg.channel.send(scoreboardReply);
        gameStarted = false;
      };
    }
    if (msg.content === '/stop') {
      msg.channel.send('Bot killed:(')
        .then(() => {
          client.destroy()
          startBot()
        })

    }
  });

  client.login(process.env.TOKEN);
}
startBot()