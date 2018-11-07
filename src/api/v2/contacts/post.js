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
export default function contactsActions (/*sqlDatabase*/) {

    // ...
    const root = (_req, res) =>
        res.status(200).send("Stellar Fox API: Contacts Management")


    // ...
    return {
        root,
    }

}
