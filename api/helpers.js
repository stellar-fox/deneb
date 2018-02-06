const config = require('../config.js')
const postgresp = require('pg-promise')({})
const db = postgresp(config.attributes.connectionStr)
const axios = require('axios')
const bcrypt = require('bcrypt')


// ...
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


// ...
const tokenIsValid = function(token, userId) {
  const tokenASCII = new Buffer(token, 'base64').toString('ascii')
  return bcrypt.compareSync(`${config.attributes.apiKey}${userId}`, tokenASCII)
}


// ...
const getApiKey = function() {
  return config.attributes.apiKey
}


// ...
module.exports = {
  fetchCMC: fetchCMC,
  db: db,
  tokenIsValid: tokenIsValid,
  getApiKey: getApiKey,
}
