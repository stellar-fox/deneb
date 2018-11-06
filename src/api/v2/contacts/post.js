/**
 * Deneb.
 *
 * REST API (v2) - Contacts.
 *
 * @module api-v2-actions-contacts
 * @license Apache-2.0
 */




import axios from "axios"
import { string } from "@xcmats/js-toolbox"
import md5 from "blueimp-md5"
import {
    mailchimp as mailchimpConfig,
} from "../../../config/configuration.json"




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
    const listFederated = (req, res, next) => {
        sqlDatabase.any(
            `SELECT id, pubkey, alias, domain, currency, memo_type, \
            memo, email_md5, first_name, last_name FROM ext_contacts \
            WHERE status = ${APPROVED} AND ext_contacts.added_by = $1`,
            [ req.body.user_id ])
            .then((results) => res.status(200).send(results))
            .catch((error) => next(error.message))
    }




    // ...
    const removeFederated = (req, res, next) => {
        sqlDatabase.tx((t) => {
            return t.batch([
                t.none(
                    `UPDATE ext_contacts SET status = ${DELETED} WHERE id = $1 \
                    AND added_by = $2`, [
                        req.body.id,
                        req.body.added_by,
                    ]),
            ])
        })
            .then(() => res.status(204).send())
            .catch((error) => next(error.message))
    }




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
    const requestByEmail = async (req, res, next) => {

        let now = new Date()

        const registeredUser = await sqlDatabase.oneOrNone(
            "SELECT id FROM users WHERE email = ${email}",
            { email: req.body.email }
        )

        if (registeredUser) {
            const contact_id = await sqlDatabase.oneOrNone(
                "SELECT contact_id FROM contacts WHERE contact_id = ${contact_id} \
                AND requested_by = ${requested_by} AND status = ${status}", {
                    contact_id: registeredUser.id,
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
                    await sqlDatabase.tx((t) => {
                        return t.batch([
                            t.none(
                                "INSERT INTO contacts(contact_id, requested_by, \
                            status, created_at, updated_at) \
                            VALUES(${contact_id}, ${requested_by}, ${status}, \
                            ${created_at}, ${updated_at})",
                                {
                                    contact_id: registeredUser.id,
                                    requested_by: req.body.user_id,
                                    status: REQUESTED,
                                    created_at: now,
                                    updated_at: now,
                                }
                            ),
                            t.none(
                                "INSERT INTO contacts(contact_id, requested_by, \
                            status, created_at, updated_at, request_str) \
                            VALUES(${contact_id}, ${requested_by}, ${status}, \
                            ${created_at}, ${updated_at}, ${request_str})",
                                {
                                    contact_id: req.body.user_id,
                                    requested_by: registeredUser.id,
                                    status: PENDING,
                                    created_at: now,
                                    updated_at: now,
                                    request_str: req.body.email,
                                }
                            ),
                        ])
                    })
                } catch (error) {
                    return res.status(409).send()
                }
            }
        }

        try {
            const client = axios.create({
                auth: {
                    username: mailchimpConfig.username,
                    password: mailchimpConfig.apiKey,
                },
                headers: {
                    "Content-Type": "application/json",
                },
            })

            try {
                const subscriber = await client.get(`${mailchimpConfig.api}lists/${
                    mailchimpConfig.lists.searchByEmail}/members/${
                    md5(req.body.email.toLowerCase())
                }`)

                // email is already on the subscription list
                if (subscriber.data.status === "subscribed") {
                    return res.status(409).send()
                }

                // TODO: perhaps detect here different subscription states
                // and return proper code along with message.
                return res.status(409).send()

            } catch (_error) {
                // email is not yet on the subscription list
                await client.post(`${mailchimpConfig.api}lists/${
                    mailchimpConfig.lists.searchByEmail}/members/`, {
                    email_address: req.body.email,
                    status: "subscribed",
                    merge_fields: {
                        REFERRER: req.body.referrer.email,
                        REFERRERFN: req.body.referrer.first_name,
                        REFERRERLN: req.body.referrer.last_name,
                    },
                })
                return res.status(201).send()
            }

        } catch (error) {
            return res.status(error.response.data.status).json({
                error: error.response.data.title,
            })
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
    const updateFederated = (req, res, next) => {
        sqlDatabase
            .tx((t) => {
                const date = new Date()
                return t.batch([
                    req.body.currency ?
                        t.none(
                            "UPDATE ext_contacts SET currency = $1, \
                            updated_at = $4 WHERE id = $2 AND added_by = $3", [
                                req.body.currency,
                                req.body.id,
                                req.body.user_id,
                                date,
                            ]) : null,
                    t.none(
                        "UPDATE ext_contacts SET memo_type = 'text', \
                        memo = $1, updated_at = $4 WHERE id = $2 \
                        AND added_by = $3", [
                            req.body.memo || string.empty(),
                            req.body.id,
                            req.body.user_id,
                            date,
                        ]),
                    req.body.first_name ?
                        t.none(
                            "UPDATE ext_contacts SET first_name = $1, \
                            updated_at = $4 WHERE id = $2 AND added_by = $3", [
                                req.body.first_name,
                                req.body.id,
                                req.body.user_id,
                                date,
                            ]) : null,
                    req.body.last_name ?
                        t.none(
                            "UPDATE ext_contacts SET last_name = $1, \
                            updated_at = $4 WHERE id = $2 AND added_by = $3", [
                                req.body.last_name,
                                req.body.id,
                                req.body.user_id,
                                date,
                            ]) : null,
                    t.none(
                        "UPDATE ext_contacts SET alias = $1, \
                        updated_at = $4 WHERE id = $2 AND added_by = $3", [
                            req.body.alias || string.empty(),
                            req.body.id,
                            req.body.user_id,
                            date,
                        ]),
                    t.none(
                        "UPDATE ext_contacts SET domain = $1, \
                        updated_at = $4 WHERE id = $2 AND added_by = $3", [
                            req.body.domain || string.empty(),
                            req.body.id,
                            req.body.user_id,
                            date,
                        ]),
                ])
            })
            .then(() => res.status(204).send())
            .catch((error) => next(error.message))
    }




    // ...
    return {
        listFederated,
        removeFederated,
        requestByAccountNumber,
        requestByEmail,
        requestByPaymentAddress,
        root,
        updateFederated,
    }

}
