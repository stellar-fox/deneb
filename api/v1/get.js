const dbConfig = require('../../config.js')
const helpers = require('../helpers.js')
const postgresp = require('pg-promise')({})
const db = postgresp(dbConfig.config.connectionStr)


function latestCurrency(req, res, next) {
  db.any('select * from ticker where currency = ${currency}', {currency: req.params.currency})
    .then((dbData) => {
      // no data available - update
      if (dbData.length === 0) {
        return helpers.fetchCMC(undefined,req.params.currency)
          .then((response) => {
            db.none('insert into ticker(currency, data, updated_at) values(${currency}, ${data}, ${updated_at})', {
              currency: req.params.currency,
              data: response.data,
              updated_at: (new Date())
            })
            .then((result) => {
              res.status(200).json({
                status: 'success',
                data: response.data,
              })
            })
            .catch((error) => {
              return next(error.message)
            })
          })
          .catch((error) => {
            res.status(JSON.parse(error.message).status).json({
              statusText: JSON.parse(error.message).statusText,
            })
          })
      }
      // data too stale - update
      if (new Date(dbData[0].updated_at).getTime() < (new Date().getTime() - 1000 * 60)) {
        return helpers.fetchCMC(undefined, req.params.currency)
          .then((response) => {
            db.none('update ticker SET data = $1, updated_at = $2 where currency = $3', [response.data, (new Date()), req.params.currency])
              .then((result) => {
                res.status(200).json({
                  status: 'success',
                  data: response.data,
                })
              })
              .catch((error) => {
                return next(error.message)
              })
          })
          .catch((error) => {
            res.status(JSON.parse(error.message).status).json({
              statusText: JSON.parse(error.message).statusText,
            })
          })
      }
      // otherwise return stale data within 1 minute window
      res.status(200).json({
        status: 'success',
        data: dbData[0].data,
      })
    })
    .catch((error) => {
      return next(error.message)
    })
}

module.exports = {
  latestCurrency: latestCurrency,
}
