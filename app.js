#!/usr/bin/env node



// ...
const
    bodyParser = require("body-parser"),
    express = require("express"),
    GETAPI = require("./api/v1/get.js"),
    POSTAPI = require("./api/v1/post.js"),
    helpers = require("./api/helpers"),

    ContactsRouter = require("./api/v2/contacts/router.js"),
    UsersRouter = require("./api/v2/users/router.js"),
    AccountRouter = require("./api/v2/account/router.js"),
    whiteList = [
        "^/$",
        "^/api/?$",
        "^/api/v1/?$",
        "^/api/v2/?$",
        "^/api/v2/user/create/?$",
        "^/api/v1/account/create/?$",
        "^/favicon.ico/?$",
        "^/api/v1/user/authenticate/?$",
        "^/api/v1/ticker/latest/[a-z]{3}/?$",
        "^/api/v1/user/ledgerauth/[A-Z0-9]{56}/[0-9]{1,}/?$",
    ]




// ...
let app = express()




// ...
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.use(function (_req, res, next) {
    express.json()
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    )
    next()
})

/**
 * Check validity of token-userid pair on every API call.
 */
app.use((req, res, next) => {

    if (req.method === "OPTIONS") {
        next()
        return
    }

    if (whiteList.find((path) => {
        let re = new RegExp(path)
        return re.test(req.originalUrl)
    })) {
        next()
    } else {
        if (!helpers.tokenIsValid(req.body.token, req.body.user_id)) {
            return res.status(403).json({
                error: "Forbidden",
            })
        }
        next()
    }
})


ContactsRouter(app)
UsersRouter(app)
AccountRouter(app)


/*
 *********************
 ***** GET CALLS *****
 *********************
*/
app.get("/api/", (_req, res, _next) => res.send("Deneb - API Service"))
app.get("/api/v1/", (_req, res) => res.send("Deneb - REST API. v1"))
app.get("/api/v2/", (_req, res) => res.send("Deneb - REST API. v2"))
app.get("/api/v1/ticker/latest/:currency/", GETAPI.latestCurrency)
app.get("/api/v1/user/:id/", GETAPI.user)
app.get("/api/v1/account/:user_id/", GETAPI.account)
app.get("/api/v1/user/md5/:pubkey/", GETAPI.emailMD5)




/*
 **********************
 ***** POST CALLS *****
 **********************
*/
app.post("/api/v1/account/update/", POSTAPI.updateAccount)
app.post("/api/v1/account/create/", POSTAPI.createAccount)

app.post("/api/v1/contacts/", POSTAPI.contacts)
app.post("/api/v1/contacts/external/", POSTAPI.externalContacts)
app.post("/api/v1/contact/update/", POSTAPI.updateContact)
app.post("/api/v1/contact/delete/", POSTAPI.deleteContact)
app.post("/api/v1/contact/extupdate/", POSTAPI.updateExtContact)
app.post("/api/v1/contact/extdelete/", POSTAPI.deleteExtContact)
app.post("/api/v1/contact/request/", POSTAPI.requestContact)
app.post("/api/v1/contact/reqbyacct/", POSTAPI.requestContactByAccountNumber)
app.post("/api/v1/contact/reqlist/", POSTAPI.contactReqlist)
app.post("/api/v1/contact/addext/", POSTAPI.addExtContact)

app.post("/api/v1/user/", POSTAPI.userData)
app.post("/api/v1/user/update/", POSTAPI.updateUser)
app.post("/api/v1/user/create/", POSTAPI.createUser)
app.post("/api/v1/user/authenticate/", POSTAPI.authenticate)
app.post("/api/v1/user/ledgerauth/:pubkey/:path/", POSTAPI.issueToken)




// ...
app.listen(
    4001,
    // eslint-disable-next-line no-console
    () => console.log("Deneb::4001")
)
