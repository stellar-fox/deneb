const helpers = require("../../helpers")



// ...
const approveInternal = (req, res, next) => {
    if (!helpers.tokenIsValid(req.body.token, req.body.user_id)) {
        return res.status(403).json({
            error: "Forbidden",
        })
    }

    helpers.db.tx((t) => {
        return t.batch([
            t.none(
                "UPDATE contacts SET status = 2 WHERE contact_id = $1 \
                AND requested_by = $2", [
                    req.body.contact_id,
                    req.body.user_id,
                ]),
            t.none(
                "UPDATE contacts SET status = 2 WHERE contact_id = $1 \
                AND requested_by = $2", [
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
    if (!helpers.tokenIsValid(req.body.token, req.body.user_id)) {
        return res.status(403).json({
            error: "Forbidden",
        })
    }

    helpers.db.tx((t) => {
        return t.batch([
            t.none(
                "UPDATE contacts SET status = 3 WHERE contact_id = $1 \
                AND requested_by = $2", [
                    req.body.contact_id,
                    req.body.user_id,
                ]),
            t.none(
                "UPDATE contacts SET status = 3 WHERE contact_id = $1 \
                AND requested_by = $2", [
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
    res.status(200).send("Stellar Fox API: MailChimp Contacts Management")




// ...
const listInternal = (req, res, next) => {
    if (!helpers.tokenIsValid(req.body.token, req.body.user_id)) {
        return res.status(403).json({
            error: "Forbidden",
        })
    }
    helpers.db.any(
        "SELECT contacts.contact_id, contacts.status, contacts.created_at, \
        contacts.updated_at, COALESCE(users.first_name, '') AS first_name, \
        COALESCE(users.last_name, '') AS last_name, users.email, \
        accounts.pubkey, COALESCE(accounts.alias, '') AS alias, \
        COALESCE(accounts.domain, '') AS domain, accounts.currency, \
        accounts.precision, accounts.email_md5, accounts.memo_type, \
        accounts.memo FROM contacts INNER JOIN users ON \
        users.id = contacts.contact_id INNER JOIN accounts ON \
        users.id = accounts.user_id WHERE contacts.status = 2 AND \
        contacts.requested_by = ${user_id}",
        {
            user_id: req.body.user_id,
        })
        .then((results) => res.status(200).send(results))
        .catch((error) => next(error.message))
}




// ...
const listFederated = (req, res, next) => {
    if (!helpers.tokenIsValid(req.body.token, req.body.user_id)) {
        return res.status(403).json({
            error: "Forbidden",
        })
    }
    helpers.db.any(
        "SELECT id, pubkey, alias, domain, currency, memo_type, \
        memo, email_md5, first_name, last_name FROM ext_contacts \
        WHERE status = 2 AND ext_contacts.added_by = ${user_id}",
        {
            user_id: req.body.user_id,
        })
        .then((results) => res.status(200).send(results))
        .catch((error) => next(error.message))
}




// ...
const listRequested = (req, res, next) => {
    if (!helpers.tokenIsValid(req.body.token, req.body.user_id)) {
        return res.status(403).json({
            error: "Forbidden",
        })
    }
    helpers.db.any(
        "SELECT 'request' as type, contacts.contact_id, contacts.requested_by, \
        contacts.created_at, accounts.alias, accounts.domain, \
        accounts.pubkey, accounts.email_md5, \
        users.first_name, users.last_name \
        FROM contacts INNER JOIN accounts \
        ON contacts.requested_by = accounts.user_id \
        INNER JOIN users ON contacts.requested_by = users.id \
        WHERE contacts.contact_id = ${user_id} \
        AND contacts.status = 1", {
            user_id: req.body.user_id,
        })
        .then((results) => res.status(200).send(results))
        .catch((error) => next(error.message))
}




// ...
const listPending = (req, res, next) => {
    if (!helpers.tokenIsValid(req.body.token, req.body.user_id)) {
        return res.status(403).json({
            error: "Forbidden",
        })
    }
    helpers.db.any(
        "SELECT 'pending' as type, contacts.contact_id, contacts.requested_by, \
        contacts.created_at, accounts.alias, accounts.domain, \
        accounts.pubkey, accounts.email_md5, \
        users.first_name, users.last_name \
        FROM contacts INNER JOIN accounts \
        ON contacts.requested_by = accounts.user_id \
        INNER JOIN users ON contacts.requested_by = users.id \
        WHERE contacts.contact_id = ${user_id} \
        AND contacts.status = 5", {
            user_id: req.body.user_id,
        })
        .then((results) => res.status(200).send(results))
        .catch((error) => next(error.message))
}




// ...
const removeFederated = (req, res, next) => {
    if (!helpers.tokenIsValid(req.body.token, req.body.user_id)) {
        return res.status(403).json({
            error: "Forbidden",
        })
    }

    helpers.db.tx((t) => {
        return t.batch([
            t.none(
                "UPDATE ext_contacts SET status = 4 WHERE id = $1 \
                AND added_by = $2", [
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
    if (!helpers.tokenIsValid(req.body.token, req.body.user_id)) {
        return res.status(403).json({
            error: "Forbidden",
        })
    }
    helpers.db.tx((t) => {
        return t.batch([
            t.none(
                "UPDATE contacts SET status = 4 WHERE contact_id = $1 \
                AND requested_by = $2", [
                    req.body.contact_id,
                    req.body.user_id,
                ]),
            t.none(
                "UPDATE contacts SET status = 4 WHERE contact_id = $1 \
                AND requested_by = $2", [
                    req.body.user_id,
                    req.body.contact_id,
                ]),
        ])
    })
        .then(() => res.status(204).send())
        .catch((error) => next(error.message))
}




// ...
const requestByAccountNumber = async (req, res, _next) => {
    if (!helpers.tokenIsValid(req.body.token, req.body.user_id)) {
        return res.status(403).json({
            error: "Forbidden",
        })
    }

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
                status: 4,
            },
            (e) => e && e.contact_id
        )

        if (contact_id) {
            await helpers.db.tx((t) => {
                return t.batch([
                    t.none(
                        "UPDATE contacts SET status = 1 \
                        WHERE contact_id = ${contact_id} \
                        AND requested_by = ${requested_by}", {
                            contact_id,
                            requested_by: req.body.user_id,
                        }),
                ])
            })
            return res.status(204).send()
        } else {
            await helpers.db.none(
                "INSERT INTO contacts(contact_id, requested_by, status, \
                created_at, updated_at) VALUES(${contact_id}, ${requested_by}, \
                ${status}, ${created_at}, ${updated_at})",
                {
                    contact_id: registeredAccount.user_id,
                    requested_by: req.body.user_id,
                    status: 1,
                    created_at: now,
                    updated_at: now,
                }
            )
            return res.status(201).send()
        }
    } else {
        const federatedId = await helpers.db.oneOrNone(
            "SELECT id FROM ext_contacts WHERE pubkey = ${pubkey} \
            AND added_by = ${added_by} AND status = ${status}", {
                pubkey: req.body.pubkey,
                added_by: req.body.user_id,
                status: 4,
            },
            (e) => e && e.id
        )

        if (federatedId) {
            await helpers.db.tx((t) => {
                return t.batch([
                    t.none(
                        "UPDATE ext_contacts SET status = 2 WHERE id = ${id} \
                        AND added_by = ${added_by}", {
                            federatedId,
                            added_by: req.body.user_id,
                        }),
                ])
            })
            return res.status(204).send()
        } else {
            await helpers.db.none(
                "INSERT INTO ext_contacts(pubkey, added_by, created_at, \
                updated_at, status) VALUES(${pubkey}, ${added_by}, \
                ${created_at}, ${updated_at}, ${status})",
                {
                    pubkey: req.body.pubkey,
                    added_by: req.body.user_id,
                    created_at: now,
                    updated_at: now,
                    status: 2,
                }
            )
            return res.status(201).send()
        }
    }
}




// ...
const requestByPaymentAddress = async (req, res, next) => {
    if (!helpers.tokenIsValid(req.body.token, req.body.user_id)) {
        return res.status(403).json({
            error: "Forbidden",
        })
    }

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
                    status: 4,
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
                status: 4,
            },
            (e) => e && e.id
        )

        if (federatedId) {
            try {
                await helpers.db.tx((t) => {
                    return t.batch([
                        t.none("UPDATE ext_contacts SET status = 2 \
                               WHERE id = ${id} AND added_by = ${added_by}", {
                            federatedId,
                            added_by: req.body.user_id,
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
                        status: 2,
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
                t.none("UPDATE contacts SET status = 1 \
                WHERE contact_id = ${contactId} \
                AND requested_by = ${requestedBy}", {
                    contactId,
                    requestedBy: req.body.user_id,
                }),
                t.none("UPDATE contacts SET status = 5 \
                WHERE contact_id = ${requestedBy} \
                AND requested_by = ${contactId}", {
                    contactId,
                    requestedBy: req.body.user_id,
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
                            status: 1,
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
                            status: 5,
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
    if (!helpers.tokenIsValid(req.body.token, req.body.user_id)) {
        return res.status(403).json({
            error: "Forbidden",
        })
    }

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
                        req.body.alias || "",
                        req.body.id,
                        req.body.user_id,
                        date,
                    ]),
                t.none(
                    "UPDATE ext_contacts SET domain = $1, \
                    updated_at = $4 WHERE id = $2 AND added_by = $3", [
                        req.body.domain || "",
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
    requestByPaymentAddress,
    root,
    updateFederated,
}
