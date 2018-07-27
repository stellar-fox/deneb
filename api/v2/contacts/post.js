const
    helpers = require("../../helpers"),
    toolbox = require("@xcmats/js-toolbox"),
    REQUESTED = 1,
    APPROVED = 2,
    BLOCKED = 3,
    DELETED = 4,
    PENDING = 5



// ...
const approveInternal = (req, res, next) => {
    helpers.db.tx((t) => {
        return t.batch([
            t.none(
                `UPDATE contacts SET status = ${APPROVED} \
                WHERE contact_id = $1 AND requested_by = $2`, [
                    req.body.contact_id,
                    req.body.user_id,
                ]),
            t.none(
                `UPDATE contacts SET status = ${APPROVED} \
                WHERE contact_id = $1 AND requested_by = $2`, [
                    req.body.user_id,
                    req.body.contact_id,
                ]),
        ])
    })
        .then(() => res.status(204).send())
        .catch((error) => next(error.message))
}




// ...
const rejectInternal = (req, res, next) => {
    helpers.db.tx((t) => {
        return t.batch([
            t.none(
                `UPDATE contacts SET status = ${BLOCKED} \
                WHERE contact_id = $1 AND requested_by = $2`, [
                    req.body.user_id,
                    req.body.contact_id,
                ]),
        ])
    })
        .then(() => res.status(204).send())
        .catch((error) => next(error.message))
}




// ...
const root = (_req, res) =>
    res.status(200).send("Stellar Fox API: Contacts Management")




// ...
const listInternal = (req, res, next) => {
    helpers.db.any(
        `SELECT contacts.contact_id, contacts.status, contacts.created_at, \
        contacts.updated_at, COALESCE(users.first_name, '') AS first_name, \
        COALESCE(users.last_name, '') AS last_name, users.email, \
        accounts.pubkey, COALESCE(accounts.alias, '') AS alias, \
        COALESCE(accounts.domain, '') AS domain, accounts.currency, \
        accounts.precision, accounts.email_md5, accounts.memo_type, \
        accounts.memo FROM contacts INNER JOIN users ON \
        users.id = contacts.contact_id INNER JOIN accounts ON \
        users.id = accounts.user_id WHERE contacts.status = ${APPROVED} AND \
        contacts.requested_by = $1`,
        [ req.body.user_id, ])
        .then((results) => res.status(200).send(results))
        .catch((error) => next(error.message))
}




// ...
const listFederated = (req, res, next) => {
    helpers.db.any(
        `SELECT id, pubkey, alias, domain, currency, memo_type, \
        memo, email_md5, first_name, last_name FROM ext_contacts \
        WHERE status = ${APPROVED} AND ext_contacts.added_by = $1`,
        [ req.body.user_id, ])
        .then((results) => res.status(200).send(results))
        .catch((error) => next(error.message))
}




// ...
const listRequested = (req, res, next) => {
    helpers.db.any(
        "SELECT contacts.contact_id, contacts.requested_by, \
        contacts.created_at, contacts.status, accounts.alias, accounts.domain, \
        accounts.pubkey, accounts.email_md5, \
        users.first_name, users.last_name \
        FROM contacts INNER JOIN accounts \
        ON contacts.requested_by = accounts.user_id \
        INNER JOIN users ON contacts.requested_by = users.id \
        WHERE contacts.contact_id = $1 \
        AND contacts.status IN ($2:csv)", [
            req.body.user_id,
            [ REQUESTED, ],
        ])
        .then((results) => res.status(200).send(results))
        .catch((error) => next(error.message))
}




// ...
const listPending = (req, res, next) => {
    helpers.db.any(
        "SELECT contacts.contact_id, contacts.requested_by, \
        contacts.created_at, contacts.status, contacts.request_str, \
        accounts.alias, accounts.domain, \
        accounts.pubkey, accounts.email_md5, \
        users.first_name, users.last_name \
        FROM contacts INNER JOIN accounts \
        ON contacts.requested_by = accounts.user_id \
        INNER JOIN users ON contacts.requested_by = users.id \
        WHERE contacts.contact_id = $1 \
        AND contacts.status IN ($2:csv)", [
            req.body.user_id,
            [ PENDING, BLOCKED, ],
        ])
        .then((results) => res.status(200).send(results))
        .catch((error) => next(error.message))
}




// ...
const removeFederated = (req, res, next) => {
    helpers.db.tx((t) => {
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
const removeInternal = (req, res, next) => {
    helpers.db.tx((t) => {
        return t.batch([
            t.none(
                `UPDATE contacts SET status = ${DELETED} \
                WHERE contact_id = $1 AND requested_by = $2`, [
                    req.body.contact_id,
                    req.body.user_id,
                ]),
            t.none(
                `UPDATE contacts SET status = ${DELETED} \
                WHERE contact_id = $1 AND requested_by = $2`, [
                    req.body.user_id,
                    req.body.contact_id,
                ]),
        ])
    })
        .then(() => res.status(204).send())
        .catch((error) => next(error.message))
}




// ...
const requestByAccountNumber = async (req, res, next) => {
    let now = new Date()

    const registeredAccount = await helpers.db.oneOrNone(
        "SELECT user_id FROM accounts WHERE pubkey = ${pubkey}",
        {
            pubkey: req.body.pubkey,
        }
    )

    if (registeredAccount) {
        const contact_id = await helpers.db.oneOrNone(
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
                await helpers.db.tx((t) => {
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
                await helpers.db.none(
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
        const federatedId = await helpers.db.oneOrNone(
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
                await helpers.db.tx((t) => {
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
                await helpers.db.none(
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

    const registeredUser = await helpers.db.oneOrNone(
        "SELECT id FROM users WHERE email = ${email}",
        { email: req.body.email, }
    )

    if (registeredUser) {
        const contact_id = await helpers.db.oneOrNone(
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
                await helpers.db.tx((t) => {
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
                await helpers.db.tx((t) => {
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
                // return res.status(201).send()
            } catch (error) {
                return res.status(409).send()
            }

            try {
                const client = helpers.axios.create({
                    auth: {
                        username: helpers.config.mailchimp.username,
                        password: helpers.config.mailchimp.apiKey,
                    },
                    headers: {
                        "Content-Type": "application/json",
                    },
                })

                await client.post(`${helpers.config.mailchimp.api}lists/${
                    helpers.config.mailchimp.listId}/members/`, {
                    email_address: req.body.email,
                    status: "subscribed",
                })

                return res.status(201).send()

            } catch (error) {
                return res.status(error.response.data.status).json({
                    error: error.response.data.title,
                })
            }

        }
    }




}



// ...
const requestByPaymentAddress = async (req, res, next) => {
    const
        now = new Date(),
        registeredUser = await helpers.db.one(
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
            contactId = await helpers.db.oneOrNone(
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

        const federatedId = helpers.db.oneOrNone(
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
                await helpers.db.tx((t) => {
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
                await helpers.db.none(
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
        await helpers.db.tx((t) => {
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
            await helpers.db.tx((t) => {
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
const unblockInternal = (req, res, next) => {
    helpers.db.tx((t) => {
        return t.batch([
            t.none(
                `UPDATE contacts SET status = ${REQUESTED} \
                WHERE contact_id = $1 AND requested_by = $2`, [
                    req.body.user_id,
                    req.body.contact_id,
                ]),
        ])
    })
        .then(() => res.status(204).send())
        .catch((error) => next(error.message))
}



// ...
const updateFederated = (req, res, next) => {
    helpers.db
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
                req.body.memo ?
                    t.none(
                        "UPDATE ext_contacts SET memo_type = 'text', \
                        memo = $1, updated_at = $4 WHERE id = $2 \
                        AND added_by = $3", [
                            req.body.memo,
                            req.body.id,
                            req.body.user_id,
                            date,
                        ]) : null,
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
                        req.body.alias || toolbox.emptyString(),
                        req.body.id,
                        req.body.user_id,
                        date,
                    ]),
                t.none(
                    "UPDATE ext_contacts SET domain = $1, \
                    updated_at = $4 WHERE id = $2 AND added_by = $3", [
                        req.body.domain || toolbox.emptyString(),
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
module.exports = {
    approveInternal,
    listFederated,
    listInternal,
    listPending,
    listRequested,
    rejectInternal,
    removeFederated,
    removeInternal,
    requestByAccountNumber,
    requestByEmail,
    requestByPaymentAddress,
    root,
    unblockInternal,
    updateFederated,
}
