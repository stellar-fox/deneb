/**
 * Deneb.
 *
 * API v1 actions.
 *
 * @module actions
 * @license Apache-2.0
 */




import { sql } from "../../../lib/utils"
import updateUserDataSQL from "./update_user_data.sql"




/**
 * ...
 *
 * @function updateUserData
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function updateUserData (sqlDatabase) {

    return (req, res, next) =>

        sqlDatabase
            .none(sql(__dirname, updateUserDataSQL), {
                id: req.body.user_id,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
            })
            .then((_) => {
                res.status(204).json({
                    status: "success",
                })
                next()
            })
            .catch((error) => next(error.message))

}
