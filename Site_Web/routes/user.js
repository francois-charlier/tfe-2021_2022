const express = require('express')
const jwt = require("jsonwebtoken")
var dayjs = require('dayjs')
const path = require('path')
var bodyParser = require('body-parser')
const argon2 = require('argon2');
const pool = require('../helpers/database')
const router = express.Router()

require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
var jsonParser = bodyParser.json()


function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '24h' })
}

router.post("/login", jsonParser, async (req, res) => {
    try{
        const { email, password } = req.body;
        const sql = 'SELECT id_user, email, password, date_creation FROM users WHERE email = ?;'
        const result = await pool.query(sql, email)
        
        if (await argon2.verify(result[0].password, password)){
            res.cookie("token", generateAccessToken(result[0]), {
                secure: true,
                httpOnly: true,
                expires: dayjs().add(1, "days").toDate()
            });
            res.send("succes")
        }
        else {
            res.send("error")
        }

    }catch(err){
        console.log(err)
    }
})

router.post("/register", jsonParser, async (req, res) => {
    try {
        const { email, password, confirm } = req.body;

        if(password == confirm) {
            const sql = 'SELECT id_user FROM users WHERE email = ?;'
            const result = await pool.query(sql, email)
            if(result.length == 0){
                const hash = await argon2.hash(password);
                const createUSer = 'INSERT INTO users (email, password, date_creation) VALUES (?,?, NOW())'
                const result1 = await pool.query(createUSer, [email, hash])
                res.send("succes")
            }
            else{
                res.send("user already exist")
            }
        }
    }
    catch (err){
        res.status(400).send(err);
    }
})

module.exports = router