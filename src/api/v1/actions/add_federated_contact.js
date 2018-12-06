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
import addFederatedContactSQL from "./add_federated_contact.sql"
import deletedFederatedContactSQL from "./deleted_federated_contact.sql"
import updateFederatedContactStatusSQL from "./update_federated_contact_status.sql"




/**
 * ...
 *
 * @function addFederatedContact
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function addFederatedContact (sqlDatabase) {

    return (req, res, next) => {

        let now = new Date()

        /**
         * preemptive search in contacts in case status is set to
         * "DELETED" (4)
         */
        sqlDatabase
            .oneOrNone(
                sql(__dirname, deletedFederatedContactSQL), {
                    pubkey: req.body.pubkey,
                    alias: req.body.alias,
                    domain: req.body.domain,
                    added_by: req.body.user_id,
                    status: 4,
                },
                e => e && e.id
            )
            .then((id) => {
                id ?
                    /**
                     * this relation already exists in ext_contacts table so update
                     * status on the relation to "VISIBLE" (2)
                     */
                    sqlDatabase
                        .tx((t) => {
                            return t.batch([
                                t.none(
                                    sql(__dirname, updateFederatedContactStatusSQL),
                                    {
                                        id,
                                        added_by: req.body.user_id,
                                    }
                                ),
                            ])
                        })
                        .then((result) => {
                            res.status(201).json({
                                success: true,
                                result,
                            })
                        })
                        .catch((error) => {
                            const retCode = errorMessageToRetCode(error.message)
                            res.status(retCode).json({
                                status: "failure",
                                id: error.message,
                                code: retCode,
                            })
                            next()
                        }) :

                    /**
                     * this is a new ext relation so insert new row to table with
                     * status "VISIBLE" (2)
                     */
                    sqlDatabase
                        .one(sql(__dirname, addFederatedContactSQL),
                            {
                                pubkey: req.body.pubkey,
                                added_by: req.body.user_id,
                                alias: req.body.alias,
                                domain: req.body.domain,
                                created_at: now,
                                updated_at: now,
                                status: 2,
                            }
                        )
                        .then((result) => {
                            res.status(201).json({
                                success: true,
                                result,
                            })
                        })
                        .catch((error) => {
                            const retCode = errorMessageToRetCode(error.message)
                            res.status(retCode).json({
                                status: "failure",
                                id: error.message,
                                code: retCode,
                            })
                        })
            })

    }

}
