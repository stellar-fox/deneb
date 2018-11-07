/**
 * Deneb.
 *
 * REST API (v2) - Contacts.
 *
 * @module api-v2-actions-contacts
 * @license Apache-2.0
 */




/**
 * ...
 *
 * @param {Object} sqlDatabase
 */
export default function contactsActions (sqlDatabase) {

    // ...
    const
        REQUESTED = 1,
        APPROVED = 2,
        DELETED = 4,
        PENDING = 5




    // ...
    const root = (_req, res) =>
        res.status(200).send("Stellar Fox API: Contacts Management")




    // ...
    const requestByAccountNumber = async (req, res, next) => {
        let now = new Date()

        const registeredAccount = await sqlDatabase.oneOrNone(
            "SELECT user_id FROM accounts WHERE pubkey = ${pubkey}",
            {
                pubkey: req.body.pubkey,
            }
        )

        if (registeredAccount) {
            const contact_id = await sqlDatabase.oneOrNone(
                "SELECT contact_id FROM contacts WHERE contact_id = ${contact_id} \
                AND requested_by = ${requested_by} AND status = ${status}", {
                    contact_id: registeredAccount.user_id,
                    requested_by: req.body.user_id,
                    status: DELETED,
                },
                (e) => e && e.contact_id
            )

            if (contact_id) {
                try {
                    await sqlDatabase.tx((t) => {
                        return t.batch([
                            t.none(
                                "UPDATE contacts SET status = ${status} \
                            WHERE contact_id = ${contact_id} \
                            AND requested_by = ${requested_by}", {
                                    contact_id,
                                    requested_by: req.body.user_id,
                                    status: REQUESTED,
                                }),
                            t.none(
                                "UPDATE contacts SET status = ${status} \
                            WHERE contact_id = ${requested_by} \
                            AND requested_by = ${contact_id}", {
                                    contact_id,
                                    requested_by: req.body.user_id,
                                    status: PENDING,
                                }),
                        ])
                    })
                    return res.status(204).send()
                } catch (error) {
                    return next(error.message)
                }

            } else {
                try {
                    await sqlDatabase.none(
                        "INSERT INTO contacts(contact_id, requested_by, status, \
                    created_at, updated_at) VALUES(${contact_id}, ${requested_by}, \
                    ${status}, ${created_at}, ${updated_at})",
                        {
                            contact_id: registeredAccount.user_id,
                            requested_by: req.body.user_id,
                            status: REQUESTED,
                            created_at: now,
                            updated_at: now,
                        }
                    )
                    return res.status(201).send()
                } catch (error) {
                    return res.status(409).send()
                }

            }
        } else {
            const federatedId = await sqlDatabase.oneOrNone(
                "SELECT id FROM ext_contacts WHERE pubkey = ${pubkey} \
                AND added_by = ${added_by} AND status = ${status}", {
                    pubkey: req.body.pubkey,
                    added_by: req.body.user_id,
                    status: DELETED,
                },
                (e) => e && e.id
            )

            if (federatedId) {
                try {
                    await sqlDatabase.tx((t) => {
                        return t.batch([
                            t.none(
                                "UPDATE ext_contacts SET status = ${status} \
                            WHERE id = ${federatedId} AND added_by = ${added_by}", {
                                    federatedId,
                                    added_by: req.body.user_id,
                                    status: APPROVED,
                                }),
                        ])
                    })
                    return res.status(204).send()
                } catch (error) {
                    return next(error.message)
                }

            } else {
                try {
                    await sqlDatabase.none(
                        "INSERT INTO ext_contacts(pubkey, added_by, created_at, \
                    updated_at, status) VALUES(${pubkey}, ${added_by}, \
                    ${created_at}, ${updated_at}, ${status})",
                        {
                            pubkey: req.body.pubkey,
                            added_by: req.body.user_id,
                            created_at: now,
                            updated_at: now,
                            status: APPROVED,
                        }
                    )
                    return res.status(201).send()
                } catch (error) {
                    return next(error.message)
                }

            }
        }
    }




    // ...
    const requestByPaymentAddress = async (req, res, next) => {
        const
            now = new Date(),
            registeredUser = await sqlDatabase.one(
                "SELECT user_id FROM accounts WHERE alias = ${alias} \
                AND domain = ${domain}",
                {
                    alias: req.body.alias,
                    domain: req.body.domain,
                }
            )

        let contactId = null

        if (registeredUser) {
            try {
                contactId = await sqlDatabase.oneOrNone(
                    "SELECT contact_id, requested_by, status FROM contacts \
                    WHERE contact_id = ${contactId} \
                    AND requested_by = ${requestedBy} AND status = ${status}", {
                        contactId: registeredUser.user_id,
                        requestedBy: req.body.user_id,
                        status: DELETED,
                    },
                    (e) => e && e.contact_id
                )
            } catch (error) {
                return next(error.message)
            }
        } else {

            const federatedId = sqlDatabase.oneOrNone(
                "SELECT id FROM ext_contacts WHERE pubkey = ${pubkey} \
                AND added_by = ${added_by} AND status = ${status}", {
                    pubkey: req.body.pubkey,
                    added_by: req.body.user_id,
                    status: DELETED,
                },
                (e) => e && e.id
            )

            if (federatedId) {
                try {
                    await sqlDatabase.tx((t) => {
                        return t.batch([
                            t.none("UPDATE ext_contacts SET status = ${status} \
                                WHERE id = ${federatedId} AND added_by = ${added_by}", {
                                federatedId,
                                added_by: req.body.user_id,
                                status: APPROVED,
                            }),
                        ])
                    })
                    return res.status(204).send()
                } catch (error) {
                    return next(error.message)
                }

            } else {
                try {
                    await sqlDatabase.none(
                        "INSERT INTO ext_contacts(pubkey, added_by, created_at, \
                        updated_at, status) VALUES(${pubkey}, ${added_by},\
                        ${created_at}, ${updated_at}, ${status})",
                        {
                            pubkey: req.body.pubkey,
                            added_by: req.body.user_id,
                            created_at: now,
                            updated_at: now,
                            status: APPROVED,
                        }
                    )
                    return res.status(201).send()
                } catch (error) {
                    return next(error.message)
                }

            }
        }

        if (contactId) {
            await sqlDatabase.tx((t) => {
                return t.batch([
                    t.none("UPDATE contacts SET status = ${status} \
                    WHERE contact_id = ${contactId} \
                    AND requested_by = ${requestedBy}", {
                        contactId,
                        requestedBy: req.body.user_id,
                        status: REQUESTED,
                    }),
                    t.none("UPDATE contacts SET status = ${status} \
                    WHERE contact_id = ${requestedBy} \
                    AND requested_by = ${contactId}", {
                        contactId,
                        requestedBy: req.body.user_id,
                        status: PENDING,
                    }),
                ])
            })
            return res.status(204).send()
        } else {
            try {
                await sqlDatabase.tx((t) => {
                    return t.batch([
                        t.none(
                            "INSERT INTO contacts(contact_id, requested_by, \
                            status, created_at, updated_at) VALUES(${contact_id}, \
                            ${requested_by}, ${status}, ${created_at}, \
                            ${updated_at})",
                            {
                                contact_id: registeredUser.user_id,
                                requested_by: req.body.user_id,
                                status: REQUESTED,
                                created_at: now,
                                updated_at: now,
                            }
                        ),
                        t.none(
                            "INSERT INTO contacts(contact_id, requested_by, \
                            status, created_at, updated_at) VALUES(${contact_id}, \
                            ${requested_by}, ${status}, ${created_at}, \
                            ${updated_at})",
                            {
                                contact_id: req.body.user_id,
                                requested_by: registeredUser.user_id,
                                status: PENDING,
                                created_at: now,
                                updated_at: now,
                            }
                        ),
                    ])
                })
                return res.status(201).send()
            } catch (error) {
                return res.status(409).send()
            }
        }
    }




    // ...
    return {
        requestByAccountNumber,
        requestByPaymentAddress,
        root,
    }

}
