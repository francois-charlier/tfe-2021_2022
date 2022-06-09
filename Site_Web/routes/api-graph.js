const express = require('express');
const pool = require('../helpers/database');
const router = express.Router()

async function getData(param){
    const sql = `
        SELECT `+ param +`.valeur, mesures.date 
        FROM ` + param +
        ` JOIN mesures
	    ON ` + param + `.id_mesure = mesures.id_mesure
        ORDER BY mesures.date ASC LIMIT 7;
    `;
    const result = await pool.query(sql);
    let data = [];
    let date = [];
    result.forEach(element => {
        data.push(element.valeur);
        date.push(
            new Date(element.date).toLocaleString("fr-BE", { dateStyle: "short", timeStyle: "short" })
                .replace(":", "h")
                .replaceAll("/", "-")
        )
    });
    return {donnee: [data, date]}
}

router.get("/:type?", async (req, res) => {
    switch(req.params.type){
        case "temp":
            res.send(await getData("temperature"))
            break;
        case "hum":
            res.send(await getData("humidite"))
            break;
        case "eau":
            res.send(await getData("humidite_sol"))
            break;
        case "press":
            res.send(await getData("pression"))
            break;
        case "lum":
            res.send(await getData("luminosite"))
            break;
        case "dist":
            res.send(await getData("distance"))
            break;
        default:
            res.status(404).end()
    }
})

module.exports = router