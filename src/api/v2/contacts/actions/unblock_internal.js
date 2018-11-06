/**
 * Deneb.
 *
 * 'Unblock internal contact' action.
 *
 * @module actions
 * @license Apache-2.0
 */




import { contactStatusCodes } from "../../../../lib/helpers"
import { sql } from "../../../../lib/utils"
import updateContactStatusSQL from "./update_contact_status.sql"




/**
 * ...
 *
 * @function unblockInternal
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function unblockInternal (sqlDatabase) {

    return (req, res, next) =>

        sqlDatabase
            .tx((t) =>
                t.batch([
                    t.none(
                        sql(__dirname, updateContactStatusSQL),
                        {
                            contact_id: req.body.user_id,
                            user_id: req.body.contact_id,
                            status: contactStatusCodes.REQUESTED,
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
