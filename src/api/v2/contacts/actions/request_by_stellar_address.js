/**
 * Deneb.
 *
 * 'Request contact by stellar address' action.
 *
 * @module actions
 * @license Apache-2.0
 */




import { contactStatusCodes } from "../../../../lib/helpers"
import { sql } from "../../../../lib/utils"
import getDeletedContactSQL from "./get_deleted_contact.sql"
import getDeletedFederatedContactSQL from "./get_deleted_federated_contact.sql"
import getUserIdByStellarAddressSQL from "./get_user_id_by_stellar_address.sql"
import insertContactSQL from "./insert_contact.sql"
import insertFederatedContactSQL from "./insert_federated_contact.sql"
import updateContactStatusSQL from "./update_contact_status.sql"
import updateFederatedStatusSQL from "./update_federated_status.sql"




/**
 * ...
 *
 * @function requestByStellarAddress
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function requestByStellarAddress (sqlDatabase) {

    return async (req, res, next) => {

        const
            now = new Date(),
            registeredUser = await sqlDatabase.one(
                sql(__dirname, getUserIdByStellarAddressSQL),
                {
                    alias: req.body.alias,
                    domain: req.body.domain,
                }
            )

        let contactId = null

        if (registeredUser) {
            try {
                contactId = await sqlDatabase.oneOrNone(
                    sql(__dirname, getDeletedContactSQL),
                    {
                        contactId: registeredUser.user_id,
                        requestedBy: req.body.user_id,
                        status: contactStatusCodes.DELETED,
                    },
                    (e) => e && e.contact_id
                )
            } catch (error) {
                return next(error.message)
            }
        } else {

            const federatedId = sqlDatabase.oneOrNone(
                sql(__dirname, getDeletedFederatedContactSQL),
                {
                    pubkey: req.body.pubkey,
                    added_by: req.body.user_id,
                    status: contactStatusCodes.DELETED,
                },
                (e) => e && e.id
            )

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
                    return next(error.message)
                }

            }
        }

        if (contactId) {
            await sqlDatabase.tx((t) => {
                return t.batch([
                    t.none(
                        sql(__dirname, updateContactStatusSQL),
                        {
                            contact_id: contactId,
                            user_id: req.body.user_id,
                            status: contactStatusCodes.REQUESTED,
                        }
                    ),
                    t.none(
                        sql(__dirname, updateContactStatusSQL),
                        {
                            user_id: contactId,
                            contact_id: req.body.user_id,
                            status: contactStatusCodes.PENDING,
                        }
                    ),
                ])
            })
            res.status(204).send()
            next()

        } else {
            try {
                await sqlDatabase.tx((t) => {
                    return t.batch([
                        t.none(
                            sql(__dirname, insertContactSQL),
                            {
                                contact_id: registeredUser.user_id,
                                requested_by: req.body.user_id,
                                status: contactStatusCodes.REQUESTED,
                                created_at: now,
                                updated_at: now,
                            }
                        ),
                        t.none(
                            sql(__dirname, insertContactSQL),
                            {
                                contact_id: req.body.user_id,
                                requested_by: registeredUser.user_id,
                                status: contactStatusCodes.PENDING,
                                created_at: now,
                                updated_at: now,
                            }
                        ),
                    ])
                })
                res.status(201).send()
                next()
            } catch (_error) {
                res.status(409).send()
                next()
            }
        }

    }

}
