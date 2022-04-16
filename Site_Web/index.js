const express = require('express')
const app = express()
const path = require('path')
const graph = require('./routes/api-graph.js')
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


const port = 8000

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', function (req, res) {
    res.sendFile('/pages/index.html', { root: __dirname })
})

app.get('/home', function (req, res) {
    res.sendFile('/pages/home.html', { root: __dirname })
})

app.use('/api/data', graph)

app.get('/test', function (req, res) {
    data = {
        "temperature": 20.5,
        "lux": 78,
        "pression": 998,
        "humidity": 42,
        "distance": 8.24,
        "hum_sol": 1,
        "interrupteur": 0,
        "date": "13-04-2022 15h02"
    }
    io.emit("data-send", data);
})

io.on("connection", (socket) => {
    console.log("User join");
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
})

server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});