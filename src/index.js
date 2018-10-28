/**
 * Deneb.
 *
 * Backend server.
 *
 * @module deneb-server-app
 * @license Apache-2.0
 */




import express, {
    json,
    urlencoded,
} from "express"
import {
    string,
    toBool,
} from "@xcmats/js-toolbox"
import chalk from "chalk"
import {
    port,
    whiteList,
} from "./config/env"
import {
    name as applicationName,
    version,
} from "../package.json"





// CommonJS remainings...
const
    helpers = require("./lib/helpers"),
    GETAPI = require("./api/v1/get.js"),
    POSTAPI = require("./api/v1/post.js"),
    ContactsRouter = require("./api/v2/contacts/router.js"),
    UsersRouter = require("./api/v2/users/router.js"),
    AccountRouter = require("./api/v2/account/router.js")




// http server
const app = express()




// simple request logger
app.use((req, _res, next) => {
    // eslint-disable-next-line no-console
    console.log(
        chalk.gray(string.padLeft(req.method, 8)),
        req.url
    )
    next()
})




// basic express.js server config
app.use(json())
app.use(urlencoded({ extended: true }))
app.use((_req, res, next) => {
    res.header({
        "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
        "Access-Control-Allow-Origin": "*",
        "X-Powered-By": applicationName,
    })
    next()
})




// token-userid pair validity-check
app.use((req, res, next) => {

    // don't do anything ...
    if (
        // ... if it's an `OPTIONS` request or ...
        req.method !== "OPTIONS"  &&

        // ... if request URL points to whitelisted path or ...
        !toBool(whiteList.find((path) => {
            let re = new RegExp(path)
            return re.test(req.originalUrl)
        }))  &&

        // ... if token is valid
        !helpers.tokenIsValid(req.body.token, req.body.user_id)
    ) {
        // in other case prevent access
        res.status(403)
            .json({ error: "Forbidden" })
    } else {
        next()
    }

})




// routers
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
    port,
    // eslint-disable-next-line no-console
    () => console.info(
        `[📠] deneb::${chalk.yellow(port)}`,
        `(${chalk.blueBright("v." + version)})`
    )
)
