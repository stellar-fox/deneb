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
import listRequestedContactsSQL from "./list_requested_contacts.sql"




/**
 * ...
 *
 * @function listRequested
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function listRequested (sqlDatabase) {

    return (req, res, next) =>

        sqlDatabase
            .any(
                sql(__dirname, listRequestedContactsSQL),
                {
                    user_id: req.body.user_id,
                    requested: contactStatusCodes.REQUESTED,
                }
            )
            .then((results) => {
                res.status(200).send(results)
                next()
            })
            .catch((error) => next(error.message))

}
