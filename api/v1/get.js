const helpers = require("../helpers.js")
const jws = require("../jws.js")
const db = require("../../lib/db.js")


/**
 * This function gets the user row from database based on verified signature
 * of Jason Web Token (JWT)
 * @param {Object} req Express.js request object.
 * @param {Object} res Express.js response object.
 * @param {function} _next Express.js next function in request-response cycle.
 */
async function getUser (req, res, _next) {
    const userId = await jws.getUserIdFromToken(req.params.token)
    if (!userId) {
        return res.status(403).json({
            error: "Forbidden. Invalid token.",
        })
    }
    try {
        const user = await db.one("SELECT * FROM users WHERE id = ${id}", {id: userId,})
        res.status(200).json({
            ok: true,
            user,
        })
    } catch (error) {
        res.status(helpers.codeToHttpRet(error.code)).json({
            error: error.message,
            code: error.code,
        })
    }
}


/**
 * This function gets the account row from database based on verified signature
 * of Jason Web Token (JWT)
 * @param {Object} req Express.js request object.
 * @param {Object} res Express.js response object.
 * @param {function} _next Express.js next function in request-response cycle.
 */
async function getAccount (req, res, _next) {
    const userId = await jws.getUserIdFromToken(req.params.token)
    if (!userId) {
        return res.status(403).json({
            error: "Forbidden. Invalid token.",
        })
    }
    try {
        const user = await db.one(
            "SELECT * FROM accounts WHERE user_id = ${user_id}",
            { user_id: userId, }
        )
        res.status(200).json({
            ok: true,
            user,
        })
    } catch (error) {
        res.status(helpers.codeToHttpRet(error.code)).json({
            error: error.message,
            code: error.code,
        })
    }
}



// // ...
// function emailMD5 (req, res, _next) {
//     helpers.db.any("SELECT users.first_name, users.last_name, users.email, accounts.alias, accounts.domain, accounts.email_md5 FROM accounts INNER JOIN users ON accounts.user_id = users.id WHERE accounts.pubkey = ${pubkey}", {
//         pubkey: req.params.pubkey,
//     }).then((dbData) => {
//         res.status(200).json({
//             status: "success",
//             first_name: dbData[0].first_name,
//             last_name: dbData[0].last_name,
//             email: dbData[0].email,
//             md5: dbData[0].email_md5,
//             alias: dbData[0].alias,
//             domain: dbData[0].domain,
//         })
//     }).catch((_error) => {
//         res.status(404).json({
//             error: "Not found.",
//         })
//     })
// }


async function exchangeRate (req, res, _next) {
    res.status(200).json({
        ok: true,
        fx: {},
    })
}

// ...
function latestCurrency(req, res, next) {
  helpers.db.any('select * from ticker where currency = ${currency}', {currency: req.params.currency})
    .then((dbData) => {
      // no data available - update
      if (dbData.length === 0) {
        return helpers.fetchCMC(undefined,req.params.currency)
          .then((response) => {
            helpers.db.none('insert into ticker(currency, data, updated_at) values(${currency}, ${data}, ${updated_at})', {
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
            helpers.db.none('update ticker SET data = $1, updated_at = $2 where currency = $3', [response.data, (new Date()), req.params.currency])
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


// ...
module.exports = {
//   latestCurrency: latestCurrency,
//   user: user,
//   account: account,
//     emailMD5,
//     token,
    getUser,
    getAccount,
    exchangeRate,
}
