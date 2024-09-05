const express = require("express")
const app = express()
const cors = require("cors")
const path = require("path")
const socket = require("socket.io")

app.use(cors())
app.set("port", process.env.PORT || 3000)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')))

const server = app.listen(app.get("port"), () => {
    console.log("server in port", app.get("port"))
})

const io = socket(server, {
    origin: "*",
    methods: ["GET", "POST"]
})

io.on("connection", (socket) => {
    socket.on("message", (data) => {
        io.sockets.emit("new-message", data)
    })
})