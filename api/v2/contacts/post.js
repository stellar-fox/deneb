const helpers = require("../../helpers")




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
        "SELECT contacts.contact_id, contacts.requested_by, \
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
        "SELECT contacts.contact_id, contacts.requested_by, \
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
        .then(() => res.status(204).json({}))
        .catch((error) => next(error.message))
}




// ...
const requestInternalByPaymentAddress = async (req, res, next) => {
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
                t.none("UPDATE contacts SET status = 1 \
                WHERE contact_id = ${requestedBy} \
                AND requested_by = ${contactId}", {
                    contactId,
                    requestedBy: req.body.user_id,
                }),
            ])
        })
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
            return res.status(201).json({})
        } catch (error) {
            return res.status(409).json({})
        }
    }
}



// ...
module.exports = {
    root,
    listInternal,
    listFederated,
    listRequested,
    listPending,
    removeInternal,
    requestInternalByPaymentAddress,
}