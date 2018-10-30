/**
 * Deneb.
 *
 * 'Authenticate' action.
 *
 * @module actions
 * @license Apache-2.0
 */




import bcrypt from "bcrypt"
import { array } from "@xcmats/js-toolbox"
import { getApiKey } from "../../../lib/helpers"
import { sql } from "../../../lib/utils"
import authenticateSQL from "./authenticate.sql"
import { saltRounds } from "../../../config/env"




/**
 * User authentication.
 *
 * @function authenticate
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function authenticate (sqlDatabase) {

    return async (req, res, next) => {

        sqlDatabase
            .any(sql(__dirname, authenticateSQL), {
                email: req.body.email,
            })
            .then((dbData) => {
                // user found
                if (dbData.length === 1) {
                    bcrypt.compare(
                        req.body.password,
                        array.head(dbData).password_digest,
                        (_err, auth) => {
                            if (auth) {
                                sqlDatabase
                                    .one(
                                        "SELECT pubkey, path " +
                                        "FROM accounts " +
                                        "WHERE user_id = ${user_id}",
                                        {
                                            user_id: array.head(dbData).id,
                                        }
                                    )
                                    .then((dbAccount) => {
                                        bcrypt.hash(
                                            `${getApiKey()}${array.head(dbData).id}`,
                                            saltRounds,
                                            (_error, hash) => {
                                                // authenticated
                                                res.status(200).json({
                                                    authenticated: true,
                                                    user_id: array.head(dbData).id,
                                                    pubkey: dbAccount.pubkey,
                                                    bip32Path: dbAccount.path,
                                                    token: Buffer.from(
                                                        hash
                                                    ).toString("base64"),
                                                })
                                                next()
                                            }
                                        )
                                    })
                                    .catch((error) => {
                                        // eslint-disable-next-line no-console
                                        console.log(next(error.message))
                                    })
                            } else {
                                // not authenticated
                                res.status(401).json({
                                    authenticated: false,
                                    user_id: null,
                                    pubkey: null,
                                    bip32Path: null,
                                    error: "Invalid credentials.",
                                })
                                next()
                            }
                        }
                    )
                } else {
                    // user not found in DB
                    res.status(401).json({
                        authenticated: false,
                        user_id: null,
                        pubkey: null,
                        bip32Path: null,
                        error: "Invalid credentials.",
                    })
                    next()
                }
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.log(error)
                res.status(500).json({
                    error: error.message,
                })
                next()
            })

    }

}
