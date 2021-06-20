const { clear } = require("console");
const { clearInterval } = require("timers");

function setCharAt(str, index, chr) {
  if (index > str.length - 1) return str;
  return str.substring(0, index) + chr + str.substring(index + 1);
}

const playerResponse = (client, correct_answer, msg, resolve) => {
  correct_answer = String(correct_answer);
  let refreshIntervalId = 0;
  let hint = correct_answer.replace(/[a-z]/g, "_").replace(/[A-Z]/g, "_");

  console.log("correctans", correct_answer);
  console.log("hint", hint);
  let count = 0;
  let noHints = correct_answer.length - 2;

  const giveHints = (correct_answer) => {
    if (count < noHints) {
      var index = Math.floor(Math.random() * count) + count; //generate new index
      console.log("index", index);
      console.log("count", count);
      if (hint[index] === "_") {
        hint = setCharAt(hint, index, correct_answer[index]);
        console.log(`hint here:${hint}`);
      }
      count++;
    } else {
      console.log("No more hints");
    }
  };

  client.on("message", async (msg) => {
    if (msg.content === "next") {
      if (msg.author.bot) {
      } else {
        msg.channel.send("Correct!");
        clearInterval(refreshIntervalId);
        return resolve("Done");
      }
    }
  });
  refreshIntervalId = setInterval(() => giveHints(correct_answer), 5000);
};

module.exports = {
  playerResponse,
};
