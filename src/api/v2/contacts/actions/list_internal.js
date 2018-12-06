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
import listApprovedContactsSQL from "./list_approved_contacts.sql"




/**
 * ...
 *
 * @function listInternal
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function listInternal (sqlDatabase) {

    return (req, res, next) =>

        sqlDatabase
            .any(
                sql(__dirname, listApprovedContactsSQL),
                {
                    user_id: req.body.user_id,
                    approved: contactStatusCodes.APPROVED,
                }
            )
            .then((results) => {
                res.status(200).send(results)
                next()
            })
            .catch((error) => next(error.message))

}
