#!/usr/bin/env node
const GETAPI = require("./api/v1/get.js")
const POSTAPI = require("./api/v1/post.js")
const express = require("express")
const app = express()
const bodyParser = require("body-parser")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true,
}))

app.use((_req, res, next) => {
    express.json()
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    )
    next()
})


/*
 *********************
 ***** GET CALLS *****
 *********************
*/
// app.get("/api/v1", (_req, res) => res.send("Deneb - REST API. v.1"))
// app.get("/api/v1/ticker/latest/:currency", GETAPI.latestCurrency)
// app.get("/api/v1/user/:id", GETAPI.user)
// app.get("/api/v1/account/:user_id", GETAPI.account)
// app.get("/api/v1/user/md5/:pubkey", GETAPI.emailMD5)

/*
 **********************
 ***** POST CALLS *****
 **********************
*/
// app.post("/api/v1/user/create/:email/:password", POSTAPI.createUser)
// app.post("/api/v1/user/update/:id", POSTAPI.updateUser)
// app.post("/api/v1/user/authenticate/:email/:password", POSTAPI.authenticate)
// app.post("/api/v1/account/create/:user_id/:pubkey", POSTAPI.createAccount)
// app.post("/api/v1/account/update/:user_id", POSTAPI.updateAccount)
// app.post("/api/v1/user/ledgerauth/:pubkey/:path", POSTAPI.issueToken)






/*
 ******************************************************************************
 ********************************* GET CALLS **********************************
 ******************************************************************************
*/

/**
 * This call returns API version.
 * @returns {String} current API version.
 * @name GET.api/v1
 * @example https://stellarfox.net/api/v1
 */
app.get("/api/v1", (_req, res) => res.send({
    name: "Deneb",
    version: "1",
    jwt: true,
}))


/**
 * This call returns user row from database as JSON object.
 * @param {String} token JSON Web Token (JWT) issued per user.
 * @returns {Object} User row from database.
 * @name GET.api/v1/user
 * @example https://stellarfox.net/api/v1/user/xxx.yyy.zzz
 */
app.get("/api/v1/user/:token", GETAPI.getUser)


/**
 * This call returns account row from database as JSON object.
 * @param {String} token JSON Web Token (JWT) issued per user.
 * @returns {Object} Account row from database.
 * @name GET.api/v1/account
 * @example https://stellarfox.net/api/v1/account/xxx.yyy.zzz
 */
app.get("/api/v1/account/:token", GETAPI.getAccount)


/**
 * This call returns latest exchange rate against XLM and given currency.
 * @param {String} currency lower-case ISO-9425 currency code.
 * @returns {Object} Ticker exchange rate from database for given currency.
 * @name GET.api/v1/fx
 * @example https://stellarfox.net/api/v1/fx/eur
 */
app.get("/api/v1/fx/:currency", GETAPI.exchangeRate)


/*
 ******************************************************************************
 ********************************* POST CALLS *********************************
 ******************************************************************************
*/

/**
 * This call issues JWT (JSON Web Token) based on user credentials.
 * @param {String} email matching valid email format
 * @param {String} password matching valid password format
 * @returns {Object} authorization JSON including JWT.
 * @name POST.api/v1/auth
 * @example https://stellarfox.net/api/v1/auth/
 */
app.post("/api/v1/auth/", POSTAPI.authenticateUser)


/**
 * This call updates user attributes passed as query string parameters.
 * The update will only happen if valid JWT is provided.
 * @param {String} token JSON Web Token (JWT) issued per user.
 * @name POST.api/v1/user/update
 * @example https://stellarfox.net/api/v1/user/update/xxx.yyy.zzz?first_name=Jane
 */
app.post("/api/v1/user/update/:token", POSTAPI.updateUserAttributes)


/**
 * This call updates account attributes passed as query string parameters.
 * The update will only happen if a valid JWT is provided.
 * @param {String} token JSON Web Token (JWT) issued per user.
 * @name POST.api/v1/account/update
 * @example https://stellarfox.net/api/v1/account/update/xxx.yyy.zzz?alias=Jane&domain=example.com
 */
app.post("/api/v1/account/update/:token", POSTAPI.updateAccountAttributes)


/**
 * This call creates a new user in the database.
 * @param {String} token JSON Web Token (JWT) issued per user.
 * @name POST.api/v1/user/create
 * @example https://stellarfox.net/api/v1/user/create/user@example.com/P@33w0r$
 */
app.post("/api/v1/user/create/:email/:password", POSTAPI.createUser)


/**
 * This call creates new account in the database.
 * New account will only be created if a valid JWT is provided and required
 * query parameters provided.
 * @param {String} token JSON Web Token (JWT) issued per user.
 * @name POST.api/v1/account/create
 * @example https://stellarfox.net/api/v1/account/create/xxx.yyy.zzz?pubkey=GAZOFOR&path=0
 */
app.post("/api/v1/account/create/:token", POSTAPI.createAccount)



// eslint-disable-next-line no-console
app.listen(4001, () => console.log("Deneb::4001"))
