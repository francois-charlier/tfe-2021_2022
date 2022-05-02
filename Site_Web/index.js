const express = require('express')
const jwt = require("jsonwebtoken")
const app = express()
const dayjs = require('dayjs')
const path = require('path')
const graph = require('./routes/api-graph.js')
const user = require('./routes/user.js')
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
var bodyParser = require('body-parser')
const pool = require('./helpers/database.js')
const e = require('express')
const io = new Server(server);

var jsonParser = bodyParser.json()

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

app.get('/logout', function (req, res) {
    res.clearCookie('token')
    res.end("succes")
})

app.use('/api/data', graph)

app.use('/api', user)

app.post('/api/proximus', jsonParser, async function (req, res) {
    if (req.header("token") === process.env.PROXIMUS_TOKEN){
        let cle = Object.keys(req.body);
        let sql = `
            INSERT INTO mesures (date) VALUES (NOW());
        `;
        cle.forEach(i => {
            switch(i){
                case ("temperature"):
                    sql += `
                        INSERT INTO temperature (valeur, id_mesure, id_unite) VALUES (` + String(req.body[i]) +`, (SELECT id_mesure FROM mesures
                        WHERE DATE IN (SELECT MAX(DATE) FROM mesures)), (SELECT id_unite FROM unites WHERE symbole = '°C'));
                    `;
                    req.body["temperature"] += " °C";
                    break;
                case ("humidite"):
                    sql += `
                        INSERT INTO humidite (valeur, id_mesure, id_unite) VALUES (` + String(req.body[i]) + `, (SELECT id_mesure FROM mesures
                        WHERE DATE IN (SELECT MAX(DATE) FROM mesures)), (SELECT id_unite FROM unites WHERE symbole = '%'));
                    `;
                    req.body["humidite"] += " %";
                    break;
                case ("humidite_sol"):
                    sql += `
                        INSERT INTO humidite_sol (valeur, id_mesure) VALUES (` + String(req.body[i]) + `, (SELECT id_mesure FROM mesures
                        WHERE DATE IN (SELECT MAX(DATE) FROM mesures)));
                    `;
                    break;
                case ("interrupteur"):
                    sql += `
                        INSERT INTO interrupteur (valeur, id_mesure) VALUES (` + String(req.body[i]) + `, (SELECT id_mesure FROM mesures
                        WHERE DATE IN (SELECT MAX(DATE) FROM mesures)));
                    `;
                    break;
                case ("distance"):
                    sql += `
                        INSERT INTO distance (valeur, id_mesure, id_unite) VALUES (` + String(req.body[i]) + `, (SELECT id_mesure FROM mesures
                        WHERE DATE IN (SELECT MAX(DATE) FROM mesures)), (SELECT id_unite FROM unites WHERE symbole = 'cm'));
                    `;
                    req.body["distance"] += " cm";
                    break;
                case ("luminosite"):
                    sql += `
                        INSERT INTO luminosite (valeur, id_mesure, id_unite) VALUES (` + String(req.body[i]) + `, (SELECT id_mesure FROM mesures
                        WHERE DATE IN (SELECT MAX(DATE) FROM mesures)), (SELECT id_unite FROM unites WHERE symbole = 'lx'));
                    `;
                    req.body["luminosite"] += " lx";
                    break;
                case ("pression"):
                    sql += `
                        INSERT INTO pression (valeur, id_mesure, id_unite) VALUES (` + String(req.body[i]) + `, (SELECT id_mesure FROM mesures
                        WHERE DATE IN (SELECT MAX(DATE) FROM mesures)), (SELECT id_unite FROM unites WHERE symbole = 'hPa'));
                    `;
                    req.body["pression"] += " hPa";
                    break;
            }
        })
        sql += `
            SELECT date FROM mesures
            WHERE DATE IN (SELECT MAX(DATE) FROM mesures);
        `;
        let result = await pool.query(sql);
        req.body.date = new Date(result[result.length - 1][0]["date"]).toLocaleString("fr-BE", { dateStyle: "short", timeStyle: "short" })
        .replace(":", "h")
        .replaceAll("/", "-")
        io.emit("data-send", req.body);
        res.status(200).end()
    }
    else{
        res.status(401).end()
    }
})

io.on("connection", async (socket) => {
    console.log("User join");

    const table_name = ["temperature", "humidite", "humidite_sol", "interrupteur", "luminosite", "pression", "distance"];
    let sql = "";
    table_name.forEach(i => {
        if(i == "interrupteur" || i == "humidite_sol"){
            sql += `
            SELECT ` + i + `.valeur AS ` + i +
            ` FROM ` + i +
            ` WHERE ` + i + `.id_mesure = (SELECT id_mesure FROM mesures
            WHERE DATE IN (SELECT MAX(DATE) FROM mesures));
            `;
        }
        else {
            sql += `
            SELECT ` + i + `.valeur AS ` + i + ` , unites.symbole
            FROM ` + i +
                    ` JOIN unites ON unites.id_unite = ` + i + `.id_unite
            WHERE ` + i + `.id_mesure = (SELECT id_mesure FROM mesures
            WHERE DATE IN (SELECT MAX(DATE) FROM mesures));
            `;
        }
    })
    sql += `
    SELECT mesures.date FROM mesures
    WHERE mesures.id_mesure = (SELECT id_mesure FROM mesures
    WHERE DATE IN (SELECT MAX(DATE) FROM mesures));
    `;
    const result = await pool.query(sql);
    const data = {};
    result.forEach(i =>{
        if (i[0] != undefined) { 
            let keys = Object.keys(i[0]);
            if (keys.length == 2){
                data[Object.keys(i[0])[0]] = (i[0][keys[0]] + " " + i[0][keys[1]])
            }
            else if (keys[0] == "date"){
                data[Object.keys(i[0])[0]] = new Date(i[0]["date"]).toLocaleString("fr-BE",  {dateStyle: "short", timeStyle: "short"})
                .replace(":", "h")
                .replaceAll("/", "-")
            }
            else{
                data[Object.keys(i[0])[0]] = i[0][keys[0]]
            }
        }
    })
    io.emit("data-send", data);
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
})

server.listen(port, () => {
    console.log(`Listening on port ${port}, visit http://localhost:${port}`);
});