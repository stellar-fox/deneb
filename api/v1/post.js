const helpers = require("../helpers.js")
const jws = require("../jws.js")
const bcrypt = require("bcrypt")
const db = require("../../lib/db.js")


/**
 * This function creates user entry in the database.
 * @param {Object} req Express.js request object.
 * @param {Object} res Express.js response object.
 * @param {function} _next Express.js next function in request-response cycle.
 */
async function createUser (req, res, _next) {
    if (!helpers.emailIsValid(req.params.email) ||
        !helpers.passwordIsValid(req.params.password)) {
        return res.status(403).json({ // WRONG CREDENTIALS FORMAT
            authenticated: false,
            error: "Invalid credentials format.",
        })
    }
    const now = new Date()
    const password_digest = helpers.btoh(
        bcrypt.hashSync(req.params.password, 10)
    )
    try {
        const user = await db.one("INSERT INTO users (email, password_digest,\
            created_at, updated_at) VALUES (${email}, ${password_digest},\
            ${created_at}, ${updated_at}) RETURNING *", {
            email: req.params.email,
            password_digest,
            created_at: now,
            updated_at: now,
        })
        return res.status(201).json({ // USER CREATED
            authenticated: true,
            token: jws.signature(JSON.stringify({
                userId: user.id,
                expires: new Date(new Date().getTime() + 20 * 60000).getTime(),
            }), user.password_digest),
        })    
    } catch (error) {
        return res.status(helpers.codeToHttpRet(error.code)).json({
            error: error.message,
            code: error.code,
        })
    }
}


/**
 * This function creates account entry in the database.
 * @param {Object} req Express.js request object.
 * @param {Object} res Express.js response object.
 * @param {function} _next Express.js next function in request-response cycle.
 */
async function createAccount (req, res, _next) {
    const userId = await jws.getUserIdFromToken(req.params.token)
    if (!userId) {
        return res.status(403).json({
            error: "Forbidden. Invalid token.",
        })
    }
    try {
        const now = new Date()
        const account = await db.one(
            "INSERT INTO accounts (pubkey, path, alias, domain, user_id,\
                email_md5, visible, created_at, updated_at) VALUES\
                (${pubkey}, ${path}, ${alias}, ${domain}, ${user_id},\
                    ${email_md5}, ${visible}, ${created_at}, ${updated_at})\
                    RETURNING *",
            {
                pubkey: req.query.pubkey,
                path: req.query.path,
                alias: req.query.alias,
                domain: req.query.domain,
                user_id: userId,
                email_md5: req.query.md5,
                visible: (_) => {
                    return (req.query.visible == "false" ? false : true)
                },
                created_at: now,
                updated_at: now,
            }
        )
        return res.status(201).json({ // ACCOUNT CREATED
            ok: true,
            id: account.id,
        })    
    } catch (error) {
        return res.status(helpers.codeToHttpRet(error.code)).json({
            error: error.message,
            code: error.code,
        })
    }
}


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
        const user = await db.one("SELECT userId FROM users WHERE\
            email = ${email} AND password_digest = ${password_digest}",{
            email: req.params.email,
            password_digest: req.params.password_digest,})
        if (!user) {
            return res.status(401).json({ // WRONG CREDENTIALS
                authenticated: false,
                error: "Wrong credentials.",
            })
        }
        return res.status(200).json({ // SUCCESSFULLY AUTHENTICATED
            authenticated: true,
            token: jws.signature(JSON.stringify({
                userId: user.id,
                expires: new Date(new Date().getTime() + 20 * 60000).getTime(),
            }), user.password_digest),
        })
    }
    catch (error){ // EMAIL NOT FOUND OR ANY OTHER ERROR
        return res.status(helpers.codeToHttpRet(error.code)).json({
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
                    t.none("UPDATE accounts SET alias = $1, domain = $2 WHERE\
                    user_id = $3", [
                        helpers.getFedAlias(req.query.alias),
                        helpers.getFedDomain(req.query.domain),
                        userId,
                    ])
                    : null
                ),
                // account visibility
                (req.query.visible !== undefined ?
                    t.none("UPDATE accounts SET visible = ${visible} WHERE\
                    user_id = ${user_id}", { visible: () => {
                        return (req.query.visible == "false" ? false : true)
                    },
                    user_id: userId,
                    }) : null
                ),
                // default currency
                (req.query.currency !== undefined ?
                    t.none("UPDATE accounts SET currency = $1 WHERE\
                    user_id = $2", [req.query.currency, userId,]) : null
                ),
                // display precission
                (req.query.precision !== undefined ?
                    t.none("UPDATE accounts SET precision = $1 WHERE\
                    user_id = $2", [req.query.precision, userId,]) : null
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
    createUser,
    createAccount,
    authenticateUser,
    updateUserAttributes,
    updateAccountAttributes,
}
