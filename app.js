#!/usr/bin/env node
const GETAPI = require("./api/v1/get.js")
const POSTAPI = require("./api/v1/post.js")
const express = require("express")
const app = express()


app.use((_req, res, next) => {
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
 *********************
 ***** GET CALLS *****
 *********************
*/

/**
 * This call returns API version.
 * @returns {String} current API version.
 * @name GET.api/v1.1
 * @example https://stellarfox.net/api/v1.1
 */
app.get("/api/v1.1", (_req, res) => res.send({
    name: "Deneb",
    version: "1.1",
    jwt: true,
}))



/*
 **********************
 ***** POST CALLS *****
 **********************
*/

/**
 * This call issues JWT (JSON Web Token) based on user credentials.
 * @param {String} email matching valid email format
 * @param {String} password matching valid password format
 * @returns {Object} authorization JSON including JWT.
 * @name POST.api/v1.1/auth
 * @example https://stellarfox.net/api/user@example.com/P@33w0r$
 */
app.post("/api/v1.1/auth/:email/:password", POSTAPI.authenticateUser)


/**
 * This call updates user attributes passed as query string parameters.
 * The update will only happen if valid JWT is provided.
 * @param {String} token JSON Web Token (JWT) issued per user.
 * @name POST.api/v1.1/user/update
 * @example https://stellarfox.net/api/v1.1/user/update/eyJhbGciOiJIUzI1NiJ9.NzY.59Ui_VLRgTZaAAXyuTaPgktw9vuafW7qIZxsbyv2v20?first_name="Jane"
 */
app.post("/api/v1.1/user/update/:token",    POSTAPI.updateUserAttributes)




// eslint-disable-next-line no-console
app.listen(4001, () => console.log("Deneb::4001"))
