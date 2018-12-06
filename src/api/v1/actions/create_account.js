/**
 * Deneb.
 *
 * API v1 actions.
 *
 * @module actions
 * @license Apache-2.0
 */




import { errorMessageToRetCode } from "../../../lib/helpers"
import { sql } from "../../../lib/utils"
import createAccountSQL from "./create_account.sql"




/**
 * ...
 *
 * @function createAccount
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function createAccount (sqlDatabase) {

    return (req, res, next) => {

        let now = new Date()

        sqlDatabase.one(sql(__dirname, createAccountSQL), {
            pubkey: req.body.pubkey,
            alias: null,
            path: req.body.path,
            user_id: req.body.user_id,
            visible: true,
            created_at: now,
            updated_at: now,
            email_md5: req.body.email_md5,
        }).then((result) => {
            res.status(201).json({
                success: true,
                account_id: result.id,
            })
            next()
        }).catch((error) => {
            const retCode = errorMessageToRetCode(error.message)
            res.status(retCode).json({
                status: "failure",
                id: error.message,
                code: retCode,
            })
            next()
        })

    }

}
