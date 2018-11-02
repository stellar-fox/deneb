/**
 * Deneb.
 *
 * 'User data' action.
 *
 * @module actions
 * @license Apache-2.0
 */




import { sql } from "../../../lib/utils"
import getFullUserDataSQL from "./get_full_user_data.sql"




/**
 * ...
 *
 * @function userData
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function userData (sqlDatabase) {

    return (req, res, next) => {

        sqlDatabase
            .one(sql(__dirname, getFullUserDataSQL), {
                id: req.body.user_id,
            })
            .then((dbData) => {
                res.status(200).json({
                    status: "success",
                    data: dbData,
                })
                next()
            })
            .catch((error) => next(error.message))

    }

}
