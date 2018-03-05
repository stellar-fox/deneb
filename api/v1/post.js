const helpers = require("../helpers.js")
const jws = require("../jws.js")
const bcrypt = require("bcrypt")
const db = require("../../lib/db.js")


// ...
// function createUser (req, res, _) {
//     bcrypt.hash(req.params.password, saltRounds, (_, hash) => {
//         let now = new Date()
//         helpers.db.one(
//             "insert into users(email, password_digest, created_at, updated_at)\
//             values(${email}, ${password_digest}, ${created_at}, ${updated_at})\
//             RETURNING id", {
//                 email: req.params.email,
//                 password_digest: hash,
//                 created_at: now,
//                 updated_at: now,
//             })
//             .then((result) => {
//                 res.status(201).json({
//                     status: "success",
//                     id: result.id,
//                 })
//             }).catch((error) => {
//                 const retCode = helpers.errorMessageToRetCode(error.message)
//                 res.status(retCode).json({
//                     status: "failure",
//                     id: error.message,
//                     code: retCode,
//                 })
//             })
//     })
// }


// ...
// function createAccount (req, res, _) {
//     let now = new Date()
//     helpers.db.one(
//         "insert into accounts\
//         (pubkey, path, alias, user_id, visible, created_at, updated_at, email_md5)\
//         values (${pubkey}, ${path}, ${alias}, ${user_id}, ${visible}, ${created_at},\
//         ${updated_at}, ${email_md5}) RETURNING id", {
//             pubkey: req.params.pubkey,
//             alias: (_) => {
//                 return (req.query.alias !== undefined ? req.query.alias : null)
//             },
//             path: req.query.path,
//             user_id: req.params.user_id,
//             visible: (_) => {
//                 return (req.query.visible == "false" ? false : true)
//             },
//             created_at: now,
//             updated_at: now,
//             email_md5: req.query.md5,
//         })
//         .then((result) => {
//             res.status(201).json({
//                 success: true,
//                 account_id: result.id,
//             })
//         })
//         .catch((error) => {
//             const retCode = helpers.errorMessageToRetCode(error.message)
//             res.status(retCode).json({
//                 status: "failure",
//                 id: error.message,
//                 code: retCode,
//             })
//         })
// }


/**
 * This function authenticates user with username/password combination and
 * returns signed Json Web Token (JWT) for future interaction with the API.
 * @param {Object} req Express.js request object.
 * @param {Object} res Express.js response object.
 * @param {function} _next Express.js next function in request-response cycle.
 * 
 */
async function authenticateUser (req, res, _next) {
    try {
        const dbRow = await db.one("SELECT * FROM users WHERE email = ${email}",
            {email: req.params.email,}
        )    
        bcrypt.compareSync(req.params.password, dbRow.password_digest) ?
            res.status(200).json({ // SUCCESSFULLY AUTHENTICATED
                authenticated: true,
                token: jws.signature(JSON.stringify({
                    userId: dbRow.id,
                    expires: new Date(new Date().getTime() + 20 * 60000).getTime(),
                }), dbRow.password_digest),
            }) :
            res.status(401).json({ // WRONG CREDENTIALS
                authenticated: false,
                error: "Wrong credentials.",
            })
    }
    catch (error){ // EMAIL NOT FOUND OR ANY OTHER ERROR
        res.status(helpers.codeToHttpRet(error.code)).json({
            authenticated: false,
            error: error.message,
            code: error.code,
        })
    }
}


/**
 * This function updates the user table based on the query parameters provided
 * as well as validity of Jason Web Token (JWT).
 * @param {Object} req Express.js request object.
 * @param {Object} res Express.js response object.
 * @param {function} _next Express.js next function in request-response cycle.
 */
async function updateUserAttributes (req, res, _next) {
    const userId = await jws.getUserIdFromToken(req.params.token)
    if (!userId) {
        return res.status(403).json({
            error: "Forbidden. Invalid token.",
        })
    }
    try {
        await db.tx(t => {
            t.batch([
                (req.query.first_name !== undefined ?
                    t.none("UPDATE users SET first_name = $1 WHERE id = $2",
                        [req.query.first_name, userId,]) : null
                ),
                (req.query.last_name !== undefined ?
                    t.none("UPDATE users SET last_name = $1 WHERE id = $2",
                        [req.query.last_name, userId,]) : null
                ),
                t.none("UPDATE users SET updated_at = $1 WHERE id = $2",
                    [new Date(), userId,]),
            ])
        })
        res.status(204).json({
            ok: true,
        })
    } catch (error) {
        res.status(helpers.codeToHttpRet(error.code)).json({
            error: error.message,
            code: error.code,
        })
    }
}


/**
 * This function updates the account table based on the query parameters
 * provided as well as validity of Jason Web Token (JWT).
 * @param {Object} req Express.js request object.
 * @param {Object} res Express.js response object.
 * @param {function} _next Express.js next function in request-response cycle.
 */
async function updateAccountAttributes (req, res, _next) {
    const userId = await jws.getUserIdFromToken(req.params.token)
    if (!userId) {
        return res.status(403).json({
            error: "Forbidden. Invalid token.",
        })
    }
    try {
        await db.tx(t => {
            t.batch([
                // alias and domain
                (req.query.alias !== undefined && req.query.domain !== undefined ?
                    t.none("UPDATE accounts SET alias = $1, domain = $2 WHERE user_id = $3",
                        [
                            helpers.getFedAlias(req.query.alias),
                            helpers.getFedDomain(req.query.domain),
                            userId,
                        ])
                    : null
                ),
                // account visibility
                (req.query.visible !== undefined ?
                    t.none("UPDATE accounts SET visible = ${visible} WHERE user_id = ${user_id}",
                        {
                            visible: () => {
                                return (req.query.visible == "false" ? false : true)
                            },
                            user_id: userId,
                        }) : null
                ),
                // default currency
                (req.query.currency !== undefined ?
                    t.none("UPDATE accounts SET currency = $1 WHERE user_id = $2",
                        [req.query.currency, userId,]) : null
                ),
                // display precission
                (req.query.precision !== undefined ?
                    t.none("UPDATE accounts SET precision = $1 WHERE user_id = $2",
                        [req.query.precision, userId,]) : null
                ),
                // always set updated_at date
                t.none("UPDATE accounts SET updated_at = $1", [new Date(),]),
            ])
        })
        res.status(204).json({
            ok: true,
        })
    } catch (error) {
        res.status(helpers.codeToHttpRet(error.code)).json({
            error: error.message,
            code: error.code,
        })
    }
}


module.exports = {
    authenticateUser,
    updateUserAttributes,
    updateAccountAttributes,
}
