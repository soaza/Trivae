const {
  time
} = require("console");
const {
  clearInterval
} = require("timers");

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
  let timeLeft = 60;
  correct_answer = String(correct_answer);

  let solved = false;
  let hint = correct_answer.replace(/[a-z]/g, "_").replace(/[A-Z]/g, "_");

  var blankIndices = [];
  for (var i = 0; i < correct_answer.length; i++) {
    if (correct_answer[i] === " ") blankIndices.push(i);
  }
  //   we use this array to keep track of un-revealed characters
  let hintIndexArr = Array.from(Array(correct_answer.length).keys());
  //   remove all indices which has underscore
  if (blankIndices.length > 0) {
    for (var i = 0; i < blankIndices.length; i++) {
      const indexToRemove = hintIndexArr.indexOf(blankIndices[i]);
      hintIndexArr.splice(indexToRemove, 1);
    }
  }

  const giveHints = (correct_answer) => {
    if (hintIndexArr.length > 0) {
      var index = Math.floor(Math.random() * hintIndexArr.length); //generate new index
      if (hint[hintIndexArr[index]] === "_") {
        hint = setCharAt(
          hint,
          hintIndexArr[index],
          correct_answer[hintIndexArr[index]]
        );
      }

      const indexToRemove = hintIndexArr.indexOf(hintIndexArr[index]);
      hintIndexArr.splice(indexToRemove, 1);

      msg.channel.send(`Hint: ${parsedHint(hint)}`);
    } else {
      msg.channel.send(`No more hints!`);
    }
  };

  client.on("message", async (msg) => {
    if (solved) return resolve("Done");

    if (msg.author.bot) {}
    // Give hints
    if (msg.content === "hint") {
      giveHints(correct_answer);
    }
    // Skip
    if (msg.content === "skip") {
      clearInterval(cooldownIntervalId);
      msg.channel.send(`Question skipped! Answer was: ${correct_answer}`);
      solved = true;

      return resolve("Done");
    }
    // Correct Answer
    if (
      String(msg.content).toLowerCase() === String(correct_answer).toLowerCase()
    ) {
      addPlayerScore(msg.author.username);
      clearInterval(cooldownIntervalId);
      msg.channel.send(`${msg.author.username} got it correct!`);
      solved = true;
      return resolve("Done");
    }
  });

  //   1 minute to solve
  setInterval(() => {
    //   clear interval for cooldown
    clearInterval(cooldownIntervalId);
    msg.channel.send(`Times up! Answer is ${correct_answer}`);
    return resolve("done");
  }, 60000);
  //   Countdown timer
  const cooldownIntervalId = setInterval(() => {
    timeLeft -= 10;
    msg.channel.send(`Time left : ${timeLeft} seconds`);
  }, 10000);
};

module.exports = {
  playerResponse,
  players,
};