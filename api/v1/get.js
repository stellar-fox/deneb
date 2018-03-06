const helpers = require("../helpers.js")
const jws = require("../jws.js")
const ticker = require("../../lib/ticker.js")
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
        const user = await db.one("SELECT * FROM users WHERE id = ${id}", {
            id: userId, })
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


/**
 * This is a throttle-like function that always returns an exchange rate based
 * on the curency provided in parameters of a call. When the rate is missing
 * or stale, then the rate is updated. Otherwise the current rate is returned
 * directly from the database.
 * @param {Object} req Express.js request object.
 * @param {Object} res Express.js response object.
 * @param {function} _next Express.js next function in request-response cycle.
 */
async function exchangeRate (req, res, _next) {
    const rate = await ticker.getRate(req.params.currency)
    // fx is missing
    if (Object.keys(rate).length === 0) {
        
        const rate = await db.one("INSERT INTO ticker (currency, data,\
            updated_at) VALUES (${currency}, ${data}, ${updated_at})\
            RETURNING *",{ currency: req.params.currency,
            data: (await ticker.fetchRate("stellar", req.params.currency)).data[0],
            updated_at: new Date(), })

        return res.status(200).json({
            ok: true,
            fx: {
                currency: req.params.currency,
                rate,
            },
        })
    }
    // fx is stale
    if (await ticker.fxIsStale(rate[0])) {
        
        const rate = await db.one("UPDATE ticker SET data = ${data},\
            updated_at = ${updated_at} WHERE currency = ${currency}\
            RETURNING *", { currency: req.params.currency,
            data: (await ticker.fetchRate("stellar", req.params.currency)).data[0],
            updated_at: new Date(), })
        
        return res.status(200).json({ ok: true, fx: {
            currency: req.params.currency,
            rate,
        }, })
    }
    // all is good, so return current rate from database
    res.status(200).json({ ok: true, fx: { currency: req.params.currency,
        rate,
    }, })
}


// ...
module.exports = {
//     emailMD5,
    getUser,
    getAccount,
    exchangeRate,
}
