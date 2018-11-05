/**
 * Deneb.
 *
 * 'Remove internal contact' action.
 *
 * @module actions
 * @license Apache-2.0
 */




import { contactStatusCodes } from "../../../../lib/helpers"
import { sql } from "../../../../lib/utils"
import updateContactStatusDeleted from "./update_contact_status_deleted.sql"




/**
 * ...
 *
 * @function removeInternal
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function removeInternal (sqlDatabase) {

    return (req, res, next) =>
        sqlDatabase.tx((t) =>
            t.batch([
                t.none(
                    sql(__dirname, updateContactStatusDeleted),
                    {
                        contact_id: req.body.contact_id,
                        user_id: req.body.user_id,
                        deleted: contactStatusCodes.DELETED,
                    }
                ),
                // this is reciprocal relation so we're switching the user_id
                // and contact_id with each other's values
                t.none(
                    sql(__dirname, updateContactStatusDeleted),
                    {
                        contact_id: req.body.user_id,
                        user_id: req.body.contact_id,
                        deleted: contactStatusCodes.DELETED,
                    }
                ),
            ])
        )
            .then(() => {
                res.status(204).send()
                next()
            })
            .catch((error) => next(error.message))

}
