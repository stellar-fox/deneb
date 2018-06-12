const helpers = require("../../helpers")



// ...
const root = (_req, res) =>
    res.status(200).send("Stellar Fox API: MailChimp Contacts Management")




// ...
const list = (req, res, next) => {
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
        users.id = accounts.user_id WHERE contacts.requested_by = ${user_id}",
        { user_id: req.body.user_id, }
    )
        .then((results) => res.status(200).send(results))
        .catch((error) => {
            return next(error.message)
        })
}



// ...
module.exports = {
    root,
    list,
}