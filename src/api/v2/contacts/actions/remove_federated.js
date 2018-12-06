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
import removeFederatedContactSQL from "./remove_federated_contact.sql"




/**
 * ...
 *
 * @function removeFederated
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function removeFederated (sqlDatabase) {

    return (req, res, next) =>

        sqlDatabase
            .any(
                sql(__dirname, removeFederatedContactSQL),
                {
                    user_id: req.body.added_by,
                    id: req.body.id,
                    deleted: contactStatusCodes.DELETED,
                }
            )
            .then((results) => {
                res.status(200).send(results)
                next()
            })
            .catch((error) => next(error.message))

}
