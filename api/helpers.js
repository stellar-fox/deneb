const dbConfig = require('../config.js')
const postgresp = require('pg-promise')({})
const db = postgresp(dbConfig.config.connectionStr)
const axios = require('axios')

const fetchCMC = function (base='stellar', quot='eur') {
  return axios.get(`https://api.coinmarketcap.com/v1/ticker/${base}/?convert=${quot}`)
    .then((response) => {
      return {
        data: response.data[0],
      }
    })
    .catch((error) => {
      throw new Error(JSON.stringify({
        status: error.response.status,
        statusText: error.response.statusText,
      }))
    })
}

module.exports = {
  fetchCMC: fetchCMC,
  db: db
}
