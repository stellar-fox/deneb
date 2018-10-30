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
import pg from "pg-promise"
import {
    string,
    toBool,
} from "@xcmats/js-toolbox"
import chalk from "chalk"
import firebaseLib from "firebase/app"
import firebaseAdminLib, {
    credential,
    database as realTimeDatabase,
} from "firebase-admin"
import { tokenIsValid } from "./lib/helpers"
import {
    port,
    whiteList,
} from "./config/env"
import {
    admin as adminConfig,
    connectionStr,
    firebase as firebaseConfig,
    firebaseDB as firebaseDBConfig,
} from "./config/configuration.json"
import {
    name as applicationName,
    version,
} from "../package.json"

import "firebase/auth"

import {
    getApiV1Routes,
    postApiV1Routes,
} from "./api/v1/routes"
import contactsRoutes from "./api/v2/contacts/routes"
import usersRoutes from "./api/v2/users/routes"
import accountRoutes from "./api/v2/account/routes"




const
    // postgresql connection
    db = pg()(connectionStr),

    // firebase stuff...
    firebaseAdmin = firebaseAdminLib.initializeApp({
        credential: credential.cert(adminConfig),
        databaseURL: firebaseDBConfig,
    }),
    firebaseApp = firebaseLib.initializeApp(firebaseConfig),
    rtdb = realTimeDatabase(),

    // http server
    app = express()




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
        "X-Powered-By": `${applicationName}/${version}`,
    })
    next()
})




// token-userid pair validity-check
app.use((req, res, next) => {

    // don't do anything ...
    if (
        // ... if it's an `OPTIONS` request ...
        req.method !== "OPTIONS"  &&

        // ... or if request URL points to whitelisted path ...
        !toBool(whiteList.find((path) => {
            let re = new RegExp(path)
            return re.test(req.originalUrl)
        }))  &&

        // ... or if token is valid
        !tokenIsValid(req.body.token, req.body.user_id)
    ) {
        // in other case prevent access
        res.status(403)
            .json({ error: "Forbidden" })
    } else {
        next()
    }

})




// "hello world" routes
app.get("/api/", (_req, res) =>
    res.status(200)
        .send({ message: "Deneb - API Service" })
)
app.get("/api/v1/", (_req, res) =>
    res.status(200)
        .send({ message: "Deneb - REST API. v1" })
)
app.get("/api/v2/", (_req, res) =>
    res.status(200)
        .send({ message: "Deneb - REST API. v2" })
)




// API v1 routes
getApiV1Routes(app, db)
postApiV1Routes(app, db)




// API v2 routes
accountRoutes(app, db, rtdb)
contactsRoutes(app, db)
usersRoutes(app, db, firebaseAdmin, firebaseApp)




// ...
app.listen(
    port,
    // eslint-disable-next-line no-console
    () => console.info(
        `[📠] deneb::${chalk.yellow(port)}`,
        `(${chalk.blueBright("v." + version)})`
    )
)
