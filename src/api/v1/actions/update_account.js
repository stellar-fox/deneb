/**
 * Deneb.
 *
 * API v1 actions.
 *
 * @module actions
 * @license Apache-2.0
 */




import { string } from "@xcmats/js-toolbox"
import { sql } from "../../../lib/utils"
import updateCurrencyPrecisionSQL from "./update_currency_precision.sql"
import updateMemoTypeSQL from "./update_memo_type.sql"
import updatePreferredCurrencySQL from "./update_preferred_currency.sql"
import updateStellarAddressSQL from "./update_stellar_address.sql"
import updateStellarAddressVisibilitySQL from "./update_stellar_address_visibility.sql"
import updateAccountsTimestampSQL from "./update_accounts_timestamp.sql"



/**
 * ...
 *
 * @function updateAccount
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function updateAccount (sqlDatabase) {

    return (req, res, next) => {

        const federationCheck = new RegExp(
            [
                /^([a-zA-Z\-0-9.@]+)\*/,
                /((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            ]
                .map((r) => r.source)
                .join(string.empty())
        )

        let alias = null,
            domain = null

        if (req.body.alias) {
            const federationMatch = req.body.alias.match(federationCheck)
            alias = federationMatch ? federationMatch[1] : null
            domain = federationMatch ? federationMatch[2] : null
        }

        !req.body.memo_type && (req.body.memo_type = string.empty())

        !req.body.memo && (req.body.memo = string.empty())


        sqlDatabase
            .tx((t) => {
                return t.batch([

                    // update memo type
                    t.none(
                        sql(__dirname, updateMemoTypeSQL),
                        {
                            memo_type: req.body.memo_type,
                            user_id: req.body.user_id,
                            memo: req.body.memo,
                        }
                    ),

                    // update stellar address (alias*domain)
                    req.body.alias ?
                        t.none(
                            sql(__dirname, updateStellarAddressSQL),
                            {alias, domain, user_id: req.body.user_id}
                        ) :
                        null,

                    // update visibility of stellar address
                    req.body.visible ?
                        t.none(
                            sql(__dirname, updateStellarAddressVisibilitySQL),
                            {
                                visible: () => req.body.visible != "false",
                                user_id: req.body.user_id,
                            }
                        ) :
                        null,

                    // update preferred currency
                    req.body.currency ?
                        t.none(
                            sql(__dirname, updatePreferredCurrencySQL),
                            {
                                currency: req.body.currency,
                                user_id: req.body.user_id,
                            }
                        ) :
                        null,

                    // update precision
                    req.body.precision ?
                        t.none(
                            sql(__dirname, updateCurrencyPrecisionSQL),
                            {
                                precision: req.body.precision,
                                user_id: req.body.user_id,
                            }
                        ) :
                        null,

                    // update timestamp
                    t.none(
                        sql(__dirname, updateAccountsTimestampSQL),
                        { updated_at: new Date() }
                    ),
                ])
            })
            .then((_) => {
                res.status(204).json({
                    status: "success",
                })
                next()
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
                next()
            })

    }

}
