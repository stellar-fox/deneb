/**
 * Deneb.
 *
 * API v1 actions.
 *
 * @module actions
 * @license Apache-2.0
 */




import bcrypt from "bcryptjs"
import { getApiKey } from "../../../lib/helpers"
import { saltRounds } from "../../../config/env"
import { array } from "@xcmats/js-toolbox"
import { sql } from "../../../lib/utils"
import getUserByPubkeyPathSQL from "./get_user_by_pubkey_path.sql"




/**
 * ...
 *
 * @function issueToken
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function issueToken (sqlDatabase) {

    return (req, res, next) =>

        sqlDatabase
            .any(
                sql(__dirname, getUserByPubkeyPathSQL),
                {
                    pubkey: req.params.pubkey,
                    path: req.params.path,
                }
            )
            .then((dbData) => {
                bcrypt.hash(
                    `${getApiKey()}${array.head(dbData).user_id}`,
                    saltRounds,
                    (_, hash) => {
                        // authenticated
                        res.status(200).json({
                            authenticated: true,
                            user_id: array.head(dbData).user_id,
                            token: Buffer.from(hash).toString("base64"),
                        })
                        next()
                    }
                )
            })
            .catch((_) => {
                res.status(401).json({
                    authenticated: false,
                    user_id: null,
                    token: null,
                })
                next()
            })

}
