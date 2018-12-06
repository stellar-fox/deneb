/**
 * Deneb.
 *
 * Contacts related actions.
 *
 * @module contacts-actions
 * @license Apache-2.0
 */




import { contactStatusCodes } from "../../../../lib/helpers"
import { sql } from "../../../../lib/utils"
import listPendingContactsSQL from "./list_pending_contacts.sql"




/**
 * ...
 *
 * @function listPending
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function listPending (sqlDatabase) {

    return (req, res, next) =>

        sqlDatabase
            .any(
                sql(__dirname, listPendingContactsSQL),
                {
                    user_id: req.body.user_id,
                    pending: contactStatusCodes.PENDING,
                    blocked: contactStatusCodes.BLOCKED,
                }
            )
            .then((results) => {
                res.status(200).send(results)
                next()
            })
            .catch((error) => next(error.message))

}
