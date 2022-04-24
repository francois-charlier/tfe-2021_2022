const express = require('express')
const jwt = require("jsonwebtoken")
const app = express()
const path = require('path')
const graph = require('./routes/api-graph.js')
const user = require('./routes/user.js')
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const { json } = require('body-parser')
const io = new Server(server);

const port = 8000
require('dotenv').config({ path: path.resolve(__dirname, '.env') })

app.use(express.static(path.join(__dirname, '/public')));

function authenticateToken(req, res, next) {

    if (!req.headers.cookie) {
        return res.status(301).redirect('/authentification')
    }

    const token = req.headers.cookie.split("=")[1]

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if(err){
            return res.status(301).redirect('/authentification')
        }
        req.user = user
        next()
    })
}

app.get('/',authenticateToken, function (req, res) {
    res.status(301).redirect('/home')
})

app.get('/home', authenticateToken, function (req, res) {
    res.sendFile('/pages/home.html', { root: __dirname })
})

app.get('/authentification', function (req, res) {
    res.sendFile('/pages/index.html', { root: __dirname })
})

app.use('/api/data', graph)

app.use('/api', user)

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
    //envois vers la db
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