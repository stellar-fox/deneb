/**
 * Deneb.
 *
 * 'List federated contacts' action.
 *
 * @module actions
 * @license Apache-2.0
 */




import { contactStatusCodes } from "../../../../lib/helpers"
import { sql } from "../../../../lib/utils"
import listFederatedContactsSQL from "./list_federated_contacts.sql"




/**
 * ...
 *
 * @function listFederated
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function listFederated (sqlDatabase) {

    return (req, res, next) =>

        sqlDatabase
            .any(
                sql(__dirname, listFederatedContactsSQL),
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
