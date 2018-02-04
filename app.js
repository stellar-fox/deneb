#!/usr/bin/env node
const dbConfig = require('./config.js')
const express = require('express')
const postgresp = require('pg-promise')({})
const axios = require('axios')
const db = postgresp(dbConfig.config.connectionStr)
const app = express()

app.get('/api/v1', (req, res) => res.send('Deneb - REST API.'))

app.get('/api/v1/ticker/latest/:currency', (req, res, next) => {
  //1. check db if updated_at is greater than 1 min.
  db.any('select * from ticker where currency = ${currency}', {currency: req.params.currency})
    .then((data) => {

      // no data available - update
      if (data.length === 0) {
        return axios.get(`https://api.coinmarketcap.com/v1/ticker/stellar/?convert=${req.params.currency}`)
          .then((response) => {
            db.none('insert into ticker(currency, data, updated_at) values(${currency}, ${data}, ${updated_at})', {
              currency: req.params.currency,
              data: response.data[0],
              updated_at: (new Date())
            })
            .then((result) => {
              res.status(200).json({
                status: 'success',
                data: response.data[0],
              })
            })
            .catch((error) => {
              return next(error.message)
            })
          })
          .catch((error) => {
            return next(error.message)
          })
      }

      // data too stale - update
      if (new Date(data[0].updated_at).getTime() < (new Date().getTime() - 1000 * 60)) {
        return axios.get(`https://api.coinmarketcap.com/v1/ticker/stellar/?convert=${req.params.currency}`)
          .then((response) => {
            db.none('update ticker SET data = $1, updated_at = $2 where currency = $3', [response.data[0], (new Date()), req.params.currency])
            .then((result) => {
              res.status(200).json({
                status: 'success',
                data: response.data[0],
              })
            })
            .catch((error) => {
              return next(error.message)
            })
          })
          .catch((error) => {
            return next(error.message)
          })
      }

      // otherwise return stale data within 1 minute window
      res.status(200).json({
        status: 'success',
        data: data[0].data,
      })

    })
    .catch((error) => {
      return next(error.message)
    })
})

app.listen(4001, () => console.log('Deneb::4001'))
