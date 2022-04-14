const express = require('express')
const path = require('path')
const graph = require('./routes/api-graph.js')

const app = express()
const port = 8000

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', function (req, res) {
    res.sendFile('/pages/index.html', { root: __dirname })
})

app.get('/home', function (req, res) {
    res.sendFile('/pages/home.html', { root: __dirname })
})

app.use('/api/data', graph)

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});