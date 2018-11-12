/**
 * Deneb.
 *
 * 'Update federated contact' action.
 *
 * @module actions
 * @license Apache-2.0
 */




import { string } from "@xcmats/js-toolbox"
import { sql } from "../../../../lib/utils"
import updateAliasSQL from "./update_alias.sql"
import updateDomainSQL from "./update_domain.sql"
import updateFirstNameSQL from "./update_first_name.sql"
import updateLastNameSQL from "./update_last_name.sql"
import updateMemoSQL from "./update_memo.sql"
import updatePreferredCurrencySQL from "./update_preferred_currency.sql"




/**
 * ...
 *
 * @function updateFederated
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function updateFederated (sqlDatabase) {

    const date = new Date()

    return (req, res, next) =>

        sqlDatabase
            .tx((t) =>
                t.batch([

                    req.body.currency ?
                        t.none(
                            sql(__dirname, updatePreferredCurrencySQL),
                            {
                                currency: req.body.currency,
                                id: req.body.id,
                                user_id: req.body.user_id,
                                date,
                            }
                        ) : null,

                    t.none(
                        sql(__dirname, updateMemoSQL),
                        {
                            memo: req.body.memo || string.empty(),
                            id: req.body.id,
                            user_id: req.body.user_id,
                            date,
                        }
                    ),

                    t.none(
                        sql(__dirname, updateFirstNameSQL), {
                            first_name: req.body.first_name || string.empty(),
                            id: req.body.id,
                            user_id: req.body.user_id,
                            date,
                        }),

                    t.none(
                        sql(__dirname, updateLastNameSQL), {
                            last_name: req.body.last_name || string.empty(),
                            id: req.body.id,
                            user_id: req.body.user_id,
                            date,
                        }),

                    t.none(
                        sql(__dirname, updateAliasSQL), {
                            alias: req.body.alias || string.empty(),
                            id: req.body.id,
                            user_id: req.body.user_id,
                            date,
                        }),

                    t.none(
                        sql(__dirname, updateDomainSQL), {
                            domain: req.body.domain || string.empty(),
                            id: req.body.id,
                            user_id: req.body.user_id,
                            date,
                        }),

                ])
            )
            .then(() => {
                res.status(204).send()
                next()
            })
            .catch((error) => next(error.message))

}
