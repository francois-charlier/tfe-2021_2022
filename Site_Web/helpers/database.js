const mariadb = require('mariadb')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const pool = mariadb.createPool({
    host: process.env.IP,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.PORT,
    connectionLimit: 5,
    allowPublicKeyRetrieval: true,
    multipleStatements: true
})

pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('DATABASE CONNECTION LOST')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('DATABASE TO MANY CONNECTION')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('DATABASE CONNECTION REFUSED')
        }
    }
    if (connection) {
        connection.release()
    }
})

module.exports = pool