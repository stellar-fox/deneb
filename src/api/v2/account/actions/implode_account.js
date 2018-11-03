/**
 * Deneb.
 *
 * 'Implode account' action.
 *
 * @module actions
 * @license Apache-2.0
 */




import { sql } from "../../../../lib/utils"
import deleteContactsRelations from "./delete_contacts_relations.sql"
import deleteFederatedContacts from "./delete_federated_contacts.sql"
import deleteAccount from "./delete_account.sql"
import deleteUser from "./delete_user.sql"



/**
 * ...
 *
 * @function implodeAccount
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function implodeAccount (sqlDatabase) {

    return (req, res, next) => {

        sqlDatabase.tx((t) => {
            t.none(
                sql(__dirname, deleteContactsRelations),
                { user_id: req.body.user_id }
            )
            t.none(
                sql(__dirname, deleteFederatedContacts),
                { user_id: req.body.user_id }
            )
            t.none(
                sql(__dirname, deleteAccount),
                { user_id: req.body.user_id }
            )
            t.none(
                sql(__dirname, deleteUser),
                { user_id: req.body.user_id }
            )
        }).then(() => {
            res.status(204).send()
            next()
        }).catch((error) => next(error.message))

    }

}
