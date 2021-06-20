const { clearInterval } = require("timers");

let players = {};

const addPlayerScore = (username) => {
  if (players[username]) {
    players[username] += 1;
  } else {
    players[username] = 1;
  }
};

function setCharAt(str, index, chr) {
  if (index > str.length - 1) return str;
  return str.substring(0, index) + chr + str.substring(index + 1);
}

const parsedHint = (hint) => {
  return hint.replace(/_/g, "-");
};

const playerResponse = (client, correct_answer, msg, resolve) => {
  correct_answer = String(correct_answer);
  console.log(correct_answer);

  let solved = false;
  let refreshIntervalId = 0;
  let hint = correct_answer.replace(/[a-z]/g, "_").replace(/[A-Z]/g, "_");

  let count = 0;
  let noHints = correct_answer.length - 2;

  const giveHints = (correct_answer) => {
    if (count < noHints) {
      var index = Math.floor(Math.random() * count) + count; //generate new index

      if (hint[index] === "_") {
        hint = setCharAt(hint, index, correct_answer[index]);
      }
      msg.channel.send(`Hint: ${parsedHint(hint)}`);
      count++;
    } else {
      msg.channel.send(`Time's up! Answer is ${correct_answer}`);
      clearInterval(refreshIntervalId);
    }
  };

  client.on("message", async (msg) => {
    if (solved) return resolve("Done");

    if (msg.author.bot) {
    }
    // Skip
    if (msg.content === "skip") {
      msg.channel.send("Question skipped!");
      clearInterval(refreshIntervalId);
      solved = true;

      return resolve("Done");
    }
    // Correct Answer
    if (
      String(msg.content).toLowerCase() === String(correct_answer).toLowerCase()
    ) {
      addPlayerScore(msg.author.username);
      msg.channel.send(`${msg.author.username} got it correct!`);
      clearInterval(refreshIntervalId);
      solved = true;
      return resolve("Done");
    }
  });

  refreshIntervalId = setInterval(() => giveHints(correct_answer), 5000);
};

module.exports = {
  playerResponse,
  players,
};
