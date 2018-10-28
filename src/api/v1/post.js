// ...
const
    bcrypt = require("bcrypt"),
    helpers = require("../../lib/helpers"),
    toolbox = require("@xcmats/js-toolbox")




// ...
const saltRounds = 10




// ...
function createUser (req, res, _) {
    bcrypt.hash(req.body.password, saltRounds, (_, hash) => {
        let now = new Date()
        helpers.db
            .one(
                "INSERT INTO " +
                    "users(email, password_digest, created_at, updated_at) " +
                    "VALUES(${email}, ${password_digest}, ${created_at}, ${updated_at}) " +
                "RETURNING id",
                {
                    email: req.body.email,
                    password_digest: hash,
                    created_at: now,
                    updated_at: now,
                }
            )
            .then((result) => {
                res.status(201).json({
                    status: "success",
                    id: result.id,
                })
            })
            .catch((error) => {
                const retCode = helpers.errorMessageToRetCode(error.message)
                res.status(retCode).json({
                    status: "failure",
                    id: error.message,
                    code: retCode,
                })
            })
    })
}




// ...
function createAccount (req, res, _) {
    let now = new Date()
    helpers.db
        .one(
            "INSERT INTO " +
                "accounts(pubkey, path, alias, user_id, visible, created_at, updated_at, email_md5) " +
                "VALUES(${pubkey}, ${path}, ${alias}, ${user_id}, ${visible}, ${created_at}, ${updated_at}, ${email_md5}) " +
            "RETURNING id",
            {
                pubkey: req.body.pubkey,
                alias: null,
                path: req.body.path,
                user_id: req.body.user_id,
                visible: true,
                created_at: now,
                updated_at: now,
                email_md5: req.body.email_md5,
            }
        )
        .then((result) => {
            res.status(201).json({
                success: true,
                account_id: result.id,
            })
        })
        .catch((error) => {
            const retCode = helpers.errorMessageToRetCode(error.message)
            res.status(retCode).json({
                status: "failure",
                id: error.message,
                code: retCode,
            })
        })
}


// ...
function addExtContact (req, res, _) {

    let now = new Date()


    /**
     * preemptive search in contacts in case status is set to
     * "DELETED" (4)
     */
    helpers.db.oneOrNone(
        "SELECT id FROM ext_contacts \
                WHERE pubkey = ${pubkey} AND alias = ${alias} \
                AND domain = ${domain} \
                AND added_by = ${added_by} AND status = ${status}", {
            pubkey: req.body.pubkey,
            alias: req.body.alias,
            domain: req.body.domain,
            added_by: req.body.user_id,
            status: 4,
        },
        e => e && e.id
    ).then((id) => {
        id ?
            /**
             * this relation already exists in ext_contacts table so update
             * status on the relation to "VISIBLE" (2)
             */
            helpers.db
                .tx((t) => {
                    return t.batch([
                        t.none(
                            "UPDATE ext_contacts SET status = 2 \
                            WHERE id = ${id} \
                            AND added_by = ${added_by}", {
                                id,
                                added_by: req.body.user_id,
                            }),
                    ])
                })
                .then((result) => {
                    res.status(201).json({
                        success: true,
                        result,
                    })
                })
                .catch((error) => {
                    const retCode = helpers.errorMessageToRetCode(error.message)
                    res.status(retCode).json({
                        status: "failure",
                        id: error.message,
                        code: retCode,
                    })
                }) :

            /**
             * this is a new ext relation so insert new row to table with
             * status "VISIBLE" (2)
             */
            helpers.db
                .one(
                    "INSERT INTO \
                    ext_contacts(pubkey, added_by, alias, \
                    domain, created_at, updated_at, status) \
                    VALUES(${pubkey}, ${added_by},\
                    ${alias}, ${domain}, ${created_at}, ${updated_at}, \
                    ${status}) RETURNING id",
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
                    const retCode = helpers.errorMessageToRetCode(error.message)
                    res.status(retCode).json({
                        status: "failure",
                        id: error.message,
                        code: retCode,
                    })
                })
    })
}


// ...
function requestContactByAccountNumber (req, res, _) {

    let now = new Date()

    /**
     * Search accounts table to determine if account number (public key) that
     * was entered belongs to a registered user. If such user is found then
     * add such user as a contact to internal contacts table. Otherwise, the
     * contact will be considered external.
     */
    helpers.db
        .one(
            "SELECT user_id FROM accounts WHERE pubkey = ${pubkey}",
            {
                pubkey: req.body.pubkey,
            }
        )
        .then((result) => {
            /**
             * preemptive search in contacts in case status is set to
             * "DELETED" (4)
             */
            helpers.db.oneOrNone(
                "SELECT contact_id FROM contacts \
                WHERE contact_id = ${contact_id} \
                AND requested_by = ${requested_by} AND status = ${status}", {
                    contact_id: result.user_id,
                    requested_by: req.body.user_id,
                    status: 4,
                },
                e => e && e.contact_id
            ).then((contact_id) => {
                contact_id ?
                    /**
                     * this relation already exists in contacts table so update
                     * status on the relation to "AWAITING APPROVAL" (1)
                     */
                    helpers.db
                        .tx((t) => {
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
                        .then((result) => {
                            res.status(201).json({
                                success: true,
                                result,
                            })
                        })
                        .catch((error) => {
                            const retCode = helpers.errorMessageToRetCode(error.message)
                            res.status(retCode).json({
                                status: "failure",
                                id: error.message,
                                code: retCode,
                            })
                        }) :

                    /**
                     * this is a new relation so insert new row to table
                     */
                    helpers.db
                        .one(
                            "INSERT INTO \
                            contacts(contact_id, requested_by, status, \
                            created_at, updated_at) \
                            VALUES(${contact_id}, ${requested_by}, \
                            ${status}, ${created_at}, ${updated_at}) \
                            RETURNING id",
                            {
                                contact_id: result.user_id,
                                requested_by: req.body.user_id,
                                status: 1,
                                created_at: now,
                                updated_at: now,
                            }
                        )
                        .then((result) => {
                            res.status(201).json({
                                success: true,
                                result,
                            })
                        })
                        .catch((error) => {
                            const retCode = helpers.errorMessageToRetCode(error.message)
                            res.status(retCode).json({
                                status: "failure",
                                id: error.message,
                                code: retCode,
                            })
                        })
            })
        })
        .catch((_error) => {
            /**
             * preemptive search in contacts in case status is set to
             * "DELETED" (4)
             */
            helpers.db.oneOrNone(
                "SELECT id FROM ext_contacts \
                WHERE pubkey = ${pubkey} \
                AND added_by = ${added_by} AND status = ${status}", {
                    pubkey: req.body.pubkey,
                    added_by: req.body.user_id,
                    status: 4,
                },
                e => e && e.id
            ).then((id) => {
                id ?
                    /**
                     * this relation already exists in ext_contacts table so update
                     * status on the relation to "VISIBLE" (2)
                     */
                    helpers.db
                        .tx((t) => {
                            return t.batch([
                                t.none(
                                    "UPDATE ext_contacts SET status = 2 \
                                    WHERE id = ${id} \
                                    AND added_by = ${added_by}", {
                                        id,
                                        added_by: req.body.user_id,
                                    }),
                            ])
                        })
                        .then((result) => {
                            res.status(201).json({
                                success: true,
                                result,
                            })
                        })
                        .catch((error) => {
                            const retCode = helpers.errorMessageToRetCode(error.message)
                            res.status(retCode).json({
                                status: "failure",
                                id: error.message,
                                code: retCode,
                            })
                        }) :

                    /**
                     * In this case we should insert the public key contact to external
                     * contacts table as this is direct mapping of personal data to a
                     * public key lowest level address.
                     */
                    helpers.db
                        .one(
                            "INSERT INTO \
                            ext_contacts(pubkey, added_by, \
                            created_at, updated_at, status) \
                            VALUES(${pubkey}, ${added_by},\
                            ${created_at}, ${updated_at}, ${status}) \
                            RETURNING id",
                            {
                                pubkey: req.body.pubkey,
                                added_by: req.body.user_id,
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
                            const retCode = helpers.errorMessageToRetCode(error.message)
                            res.status(retCode).json({
                                status: "failure",
                                id: error.message,
                                code: retCode,
                            })
                        })
            })
        })

}


// ...
function requestContact (req, res, _) {

    let now = new Date()

    // search accounts table to see if the requested contact has an account
    helpers.db
        .one(
            "SELECT user_id FROM accounts WHERE alias = ${alias} \
             AND domain = ${domain}",
            {
                alias: req.body.alias,
                domain: req.body.domain,
            }
        )
        .then((result) => {

            /**
             * preemptive search in contacts in case status is set to
             * "DELETED" (4)
             */
            helpers.db.oneOrNone(
                "SELECT contact_id, requested_by, status FROM contacts \
                WHERE contact_id = ${contact_id} \
                AND requested_by = ${requested_by} AND status = ${status}", {
                    contact_id: result.user_id,
                    requested_by: req.body.user_id,
                    status: 4,
                },
                (e) => e && e.contact_id
            ).then((contact_id) => {
                contact_id ?
                    /**
                     * this relation already exists in contacts table so update
                     * status on the relation to "AWAITING APPROVAL" (1)
                     */
                    helpers.db
                        .tx((t) => {
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
                        .then((result) => {
                            res.status(201).json({
                                success: true,
                                result,
                            })
                        })
                        .catch((error) => {
                            const retCode = helpers.errorMessageToRetCode(error.message)
                            res.status(retCode).json({
                                status: "failure",
                                id: error.message,
                                code: retCode,
                            })
                        }) :

                    /**
                     * this is a new relation so insert new row to table
                     */
                    helpers.db
                        .one(
                            "INSERT INTO \
                            contacts(contact_id, requested_by, status, \
                            created_at, updated_at) \
                            VALUES(${contact_id}, ${requested_by}, \
                            ${status}, ${created_at}, ${updated_at}) \
                            RETURNING id",
                            {
                                contact_id: result.user_id,
                                requested_by: req.body.user_id,
                                status: 1,
                                created_at: now,
                                updated_at: now,
                            }
                        )
                        .then((result) => {
                            res.status(201).json({
                                success: true,
                                result,
                            })
                        })
                        .catch((error) => {
                            const retCode = helpers.errorMessageToRetCode(error.message)
                            res.status(retCode).json({
                                status: "failure",
                                id: error.message,
                                code: retCode,
                            })
                        })
            })


        })
        .catch((_error) => {
            res.status(404).json({})
        })
}




// ...
function userData (req, res, next) {
    helpers.db
        .one("SELECT users.first_name, users.last_name, users.email, \
        accounts.alias, accounts.domain, accounts.currency, accounts.visible, \
        accounts.email_md5, accounts.memo_type, accounts.memo FROM users \
        INNER JOIN accounts ON users.id = accounts.user_id \
        WHERE users.id = ${id}", {
            id: req.body.user_id,
        })
        .then((dbData) => {
            res.status(200).json({
                status: "success",
                data: dbData,
            })
        })
        .catch((error) => {
            return next(error.message)
        })
}




// ...
function updateUser (req, res, _next) {

    helpers.db
        .tx((t) => {
            return t.batch([
                req.body.first_name ?
                    t.none("UPDATE users SET first_name = $1 WHERE id = $2", [
                        req.body.first_name,
                        req.body.user_id,
                    ]) :
                    null,
                req.body.last_name ?
                    t.none("UPDATE users SET last_name = $1 WHERE id = $2", [
                        req.body.last_name,
                        req.body.user_id,
                    ]) :
                    null,
                t.none("UPDATE users SET updated_at = $1 WHERE id = $2", [
                    new Date(),
                    req.body.user_id,
                ]),
            ])
        })
        .then((_data) => {
            res.status(204).json({
                status: "success",
            })
        })
        .catch((error) => {
            res.status(500).json({
                error: error.message,
            })
        })
}




// ...
function updateExtContact (req, res, _next) {

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
                        "UPDATE ext_contacts SET memo = $1, \
                        updated_at = $4 WHERE id = $2 AND added_by = $3", [
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
                        req.body.alias || toolbox.string.empty(),
                        req.body.id,
                        req.body.user_id,
                        date,
                    ]),
                t.none(
                    "UPDATE ext_contacts SET domain = $1, \
                    updated_at = $4 WHERE id = $2 AND added_by = $3", [
                        req.body.domain || toolbox.string.empty(),
                        req.body.id,
                        req.body.user_id,
                        date,
                    ]),
            ])
        })
        .then((_data) => {
            res.status(204).json({
                status: "success",
            })
        })
        .catch((error) => {
            res.status(500).json({
                error: error.message,
            })
        })
}



// ...
function updateContact (req, res, _next) {

    helpers.db
        .tx((t) => {
            let now = new Date()
            return t.batch([
                req.body.status ?
                    t.none("UPDATE contacts SET status = $1, updated_at = $4 \
                        WHERE contact_id = $2 AND requested_by = $3", [
                        req.body.status,
                        req.body.contact_id,
                        req.body.requested_by,
                        new Date(),
                    ]) :
                    null,
                req.body.status === 2 ? // ACCEPTED - insert reciprocal accept
                    (() => {
                        /**
                         * First check to see if the reciprocal contact already
                         * exists with status 2 (ACCEPTED). If it does then
                         * don't do anything.
                         */
                        helpers.db.oneOrNone("SELECT id FROM contacts \
                        WHERE contact_id = ${contact_id} \
                        AND requested_by = ${requested_by} \
                        AND status = 2",
                        {
                            contact_id: req.body.requested_by,
                            requested_by: req.body.contact_id,
                        }).then((result) => {
                            result ? null : (
                                helpers.db.one("INSERT INTO contacts(contact_id, \
                                requested_by, status, created_at, updated_at) \
                                VALUES(${contact_id}, ${requested_by}, \
                                ${status}, ${created_at}, ${updated_at}) " +
                                "RETURNING id",
                                {
                                    contact_id: req.body.requested_by,
                                    requested_by: req.body.contact_id,
                                    status: 2,
                                    created_at: now,
                                    updated_at: now,
                                }
                                ))
                        })

                    })() : null,
            ])
        })
        .then((_data) => {
            res.status(204).json({
                status: "success",
            })
        })
        .catch((error) => {
            res.status(500).json({
                error: error.message,
            })
        })
}




// ...
function deleteContact (req, res, _next) {

    helpers.db
        .tx((t) => {
            return t.batch([
                t.none(
                    "UPDATE contacts SET status = 4 WHERE contact_id = $1 \
                    AND requested_by = $2", [
                        req.body.contact_id,
                        req.body.requested_by,
                    ]),
            ])
        })
        .then((_data) => {
            res.status(204).json({
                status: "success",
            })
        })
        .catch((error) => {
            res.status(500).json({
                error: error.message,
            })
        })
}




// ...
function deleteExtContact (req, res, _next) {

    helpers.db
        .tx((t) => {
            return t.batch([
                t.none(
                    "UPDATE ext_contacts SET status = 4 WHERE id = $1 \
                    AND added_by = $2", [
                        req.body.id,
                        req.body.added_by,
                    ]),
            ])
        })
        .then((_data) => {
            res.status(204).json({
                status: "success",
            })
        })
        .catch((error) => {
            res.status(500).json({
                error: error.message,
            })
        })
}



// ..
function updateAccount (req, res, _next) {

    const federationCheck = new RegExp(
        [
            /^([a-zA-Z\-0-9.@]+)\*/,
            /((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        ]
            .map((r) => r.source)
            .join(toolbox.string.empty())
    )

    let alias = null,
        domain = null

    if (req.body.alias) {
        const federationMatch = req.body.alias.match(federationCheck)
        alias = federationMatch ? federationMatch[1] : null
        domain = federationMatch ? federationMatch[2] : null
    }

    !req.body.memo_type && (req.body.memo_type = toolbox.string.empty())

    !req.body.memo && (req.body.memo = toolbox.string.empty())


    helpers.db
        .tx((t) => {
            return t.batch([
                t.none(
                    "UPDATE accounts SET memo_type = $1, memo = $3 WHERE user_id = $2",
                    [req.body.memo_type, req.body.user_id, req.body.memo]
                ),
                req.body.alias ?
                    t.none(
                        "UPDATE accounts SET alias = $1, domain = $3 WHERE user_id = $2",
                        [alias, req.body.user_id, domain]
                    ) :
                    null,
                req.body.visible ?
                    t.none(
                        "UPDATE accounts SET visible = ${visible} WHERE user_id = ${user_id}",
                        {
                            visible: () => req.body.visible != "false",
                            user_id: req.body.user_id,
                        }
                    ) :
                    null,
                req.body.currency ?
                    t.none(
                        "UPDATE accounts SET currency = $1 WHERE user_id = $2",
                        [req.body.currency, req.body.user_id]
                    ) :
                    null,
                req.body.precision ?
                    t.none(
                        "UPDATE accounts SET precision = $1 WHERE user_id = $2",
                        [req.body.precision, req.body.user_id]
                    ) :
                    null,
                t.none("UPDATE accounts SET updated_at = $1", [new Date()]),
            ])
        })
        .then((_) => {
            res.status(204).json({
                status: "success",
            })
        })
        .catch((error) => {
            if (/alias_domain/.test(error.message)) {
                res.status(409).json({
                    error: "This payment address is already reserved.",
                })
            } else {
                res.status(500).json({
                    error: error.message,
                })
            }
        })
}




//  ...
function issueToken (req, res, _) {
    helpers.db
        .any(
            "SELECT user_id FROM ACCOUNTS WHERE pubkey = ${pubkey} AND path = ${path}",
            {
                pubkey: req.params.pubkey,
                path: req.params.path,
            }
        )
        .then((dbData) => {
            bcrypt.hash(
                `${helpers.getApiKey()}${toolbox.array.head(dbData).user_id}`,
                saltRounds,
                (_, hash) => {
                    // authenticated
                    res.status(200).json({
                        authenticated: true,
                        user_id: toolbox.array.head(dbData).user_id,
                        token: Buffer.from(hash).toString("base64"),
                    })
                }
            )
        })
        .catch((_) => {
            res.status(401).json({
                authenticated: false,
                user_id: null,
                token: null,
            })
        })
}




// ...
function authenticate (req, res, next) {
    helpers.db
        .any("SELECT * FROM users WHERE email = ${email}", {
            email: req.body.email,
        })
        .then((dbData) => {
            // user found
            if (dbData.length === 1) {
                bcrypt.compare(
                    req.body.password,
                    toolbox.array.head(dbData).password_digest,
                    (_err, auth) => {
                        if (auth) {
                            helpers.db
                                .one(
                                    "SELECT pubkey, path " +
                                    "FROM accounts " +
                                    "WHERE user_id = ${user_id}",
                                    {
                                        user_id: toolbox.array.head(dbData).id,
                                    }
                                )
                                .then((dbAccount) => {
                                    bcrypt.hash(
                                        `${helpers.getApiKey()}${toolbox.array.head(dbData).id}`,
                                        saltRounds,
                                        (_error, hash) => {
                                            // authenticated
                                            res.status(200).json({
                                                authenticated: true,
                                                user_id: toolbox.array.head(dbData).id,
                                                pubkey: dbAccount.pubkey,
                                                bip32Path: dbAccount.path,
                                                token: Buffer.from(
                                                    hash
                                                ).toString("base64"),
                                            })
                                        }
                                    )
                                })
                                .catch((error) => {
                                    // eslint-disable-next-line no-console
                                    console.log(next(error.message))
                                })
                        } else {
                            // not authenticated
                            res.status(401).json({
                                authenticated: false,
                                user_id: null,
                                pubkey: null,
                                bip32Path: null,
                                error: "Invalid credentials.",
                            })
                        }
                    }
                )
            } else {
                // user not found in DB
                res.status(401).json({
                    authenticated: false,
                    user_id: null,
                    pubkey: null,
                    bip32Path: null,
                    error: "Invalid credentials.",
                })
            }
        })
        .catch((error) => {
            // eslint-disable-next-line no-console
            console.log(error)
            res.status(500).json({
                error: error.message,
            })
        })
}




// ...
function contacts (req, res, next) {

    helpers.db
        .any("SELECT contact_id, \
            accounts.pubkey, accounts.alias, accounts.domain, \
            accounts.currency, accounts.memo_type, accounts.memo, \
            accounts.email_md5, \
            users.first_name, users.last_name \
            FROM contacts INNER JOIN accounts ON \
            contacts.contact_id = accounts.user_id \
            INNER JOIN users ON contacts.contact_id = users.id \
            WHERE contacts.requested_by = ${user_id} \
            AND contacts.status = 2", {
            user_id: req.body.user_id,
        })
        .then((dbData) => {
            res.status(200).json({
                status: "success",
                data: dbData,
            })
        })
        .catch((error) => {
            return next(error.message)
        })
}




// ...
function externalContacts (req, res, next) {

    helpers.db
        .any("SELECT \
            id, pubkey, alias, domain, \
            currency, memo_type, memo, \
            email_md5, \
            first_name, last_name \
            FROM ext_contacts \
            WHERE ext_contacts.added_by = ${user_id} \
            AND status = 2", {
            user_id: req.body.user_id,
        })
        .then((dbData) => {
            res.status(200).json({
                status: "success",
                data: dbData,
            })
        })
        .catch((error) => {
            return next(error.message)
        })
}




// ...
function contactReqlist (req, res, next) {

    helpers.db
        .any("SELECT \
            contacts.contact_id, contacts.requested_by, \
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
        .then((dbData) => {
            res.status(200).json({
                status: "success",
                data: dbData,
            })
        })
        .catch((error) => {
            return next(error.message)
        })
}



//...
module.exports = {
    updateUser,
    authenticate,
    createAccount,
    updateAccount,
    createUser,
    issueToken,
    userData,
    updateContact,
    updateExtContact,
    deleteContact,
    deleteExtContact,
    contacts,
    externalContacts,
    requestContact,
    contactReqlist,
    addExtContact,
    requestContactByAccountNumber,
}
