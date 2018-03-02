const postgresp = require("pg-promise")({})
const config = require("../config.js")
const db = postgresp(config.attributes.connectionStr)

module.exports = {
    one: db.one,
    any: db.any,
    tx: db.tx,
}