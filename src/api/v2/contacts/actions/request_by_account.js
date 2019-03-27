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
import getUserIdByAccountSQL from "./get_user_id_by_account.sql"
import getContactIdSQL from "./get_contact_id.sql"
import getFederatedByAccountSQL from "./get_federated_by_account.sql"
import insertContactSQL from "./insert_contact.sql"
import insertFederatedContactSQL from "./insert_federated_contact.sql"
import updateContactStatusSQL from "./update_contact_status.sql"
import updateFederatedStatusSQL from "./update_federated_status.sql"




/**
 * ...
 *
 * @function requestByAccount
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function requestByAccount (sqlDatabase) {

    return async (req, res, next) => {

        let now = new Date()
        let registeredAccount = null
        let contact_id = null

        try {
            registeredAccount = await sqlDatabase.oneOrNone(
                sql(__dirname, getUserIdByAccountSQL),
                {
                    pubkey: req.body.pubkey,
                }
            )
        } catch (error) {
            res.status(500).send()
            return next(error.message)
        }


        if (registeredAccount) {

            try {
                contact_id = await sqlDatabase.oneOrNone(
                    sql(__dirname, getContactIdSQL),
                    {
                        contact_id: registeredAccount.user_id,
                        requested_by: req.body.user_id,
                        status: contactStatusCodes.DELETED,
                    },
                    (e) => e && e.contact_id
                )
            } catch (error) {
                res.status(500).send()
                return next(error.message)
            }


            if (contact_id) {
                try {
                    await sqlDatabase.tx((t) => {
                        return t.batch([
                            t.none(
                                sql(__dirname, updateContactStatusSQL),
                                {
                                    contact_id,
                                    user_id: req.body.user_id,
                                    status: contactStatusCodes.REQUESTED,
                                }
                            ),
                            // show request on requestee list as pending
                            t.none(
                                sql(__dirname, updateContactStatusSQL),
                                {
                                    contact_id: req.body.user_id,
                                    user_id: contact_id,
                                    status: contactStatusCodes.PENDING,
                                }
                            ),
                        ])
                    })
                    res.status(204).send()
                    next()
                } catch (error) {
                    return next(error.message)
                }

            } else {

                try {
                    await sqlDatabase.none(
                        sql(__dirname, insertContactSQL),
                        {
                            contact_id: registeredAccount.user_id,
                            requested_by: req.body.user_id,
                            status: contactStatusCodes.REQUESTED,
                            created_at: now,
                            updated_at: now,
                            request_str: "",
                        }
                    )
                    await sqlDatabase.none(
                        sql(__dirname, insertContactSQL),
                        {
                            contact_id: req.body.user_id,
                            requested_by: registeredAccount.user_id,
                            status: contactStatusCodes.PENDING,
                            created_at: now,
                            updated_at: now,
                            request_str: "",
                        }
                    )
                    res.status(201).send()
                    next()
                } catch (error) {
                    res.status(409).send()
                    return next()
                }

            }
        } else {

            let federatedId = null

            try {
                federatedId = await sqlDatabase.oneOrNone(
                    sql(__dirname, getFederatedByAccountSQL),
                    {
                        pubkey: req.body.pubkey,
                        added_by: req.body.user_id,
                        status: contactStatusCodes.DELETED,
                    },
                    (e) => e && e.id
                )
            } catch (error) {
                res.status(500).send()
                return next()
            }

            if (federatedId) {
                try {
                    await sqlDatabase.tx((t) => {
                        return t.batch([
                            t.none(
                                sql(__dirname, updateFederatedStatusSQL),
                                {
                                    federatedId,
                                    added_by: req.body.user_id,
                                    status: contactStatusCodes.APPROVED,
                                }),
                        ])
                    })
                    res.status(204).send()
                    next()
                } catch (error) {
                    res.status(500).send()
                    return next(error.message)
                }

            } else {
                try {
                    await sqlDatabase.none(
                        sql(__dirname, insertFederatedContactSQL),
                        {
                            pubkey: req.body.pubkey,
                            added_by: req.body.user_id,
                            created_at: now,
                            updated_at: now,
                            status: contactStatusCodes.APPROVED,
                        }
                    )
                    res.status(201).send()
                    next()
                } catch (error) {
                    res.status(409).send()
                    return next(error.message)
                }

            }

        }

    }

}
