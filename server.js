const express = require("express")

const server = express()

server.all("/", (req, res) => {
    res.send("Bot is running")
})

const keepAlive = () => {
    server.listen((process.env.PORT || 5000), () => {
        console.log("Server is running!")
    })
}

module.exports = keepAlive