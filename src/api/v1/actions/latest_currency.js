/**
 * Deneb.
 *
 * 'Latest currency' action.
 *
 * @module actions
 * @license Apache-2.0
 */




import {
    array,
    timeUnit,
} from "@xcmats/js-toolbox"
import { fetchCMC } from "../../../lib/helpers"
import { sql } from "../../../lib/utils"
import getExchangeRateSQL from "./get_exchange_rate.sql"
import setExchangeRateSQL from "./set_exchange_rate.sql"
import updateExchangeRateSQL from "./update_exchange_rate.sql"




/**
 * ...
 *
 * @function latestCurrency
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function latestCurrency (sqlDatabase) {

    return (req, res, next) =>

        sqlDatabase
            .any(sql(__dirname, getExchangeRateSQL), {
                currency: req.params.currency,
            })
            .then((dbData) => {
                // no data available - update
                if (dbData.length === 0) {
                    return fetchCMC(undefined, req.params.currency)
                        .then((response) => {
                            sqlDatabase
                                .none(sql(__dirname, setExchangeRateSQL), {
                                    currency: req.params.currency,
                                    data: response.data,
                                    updated_at: new Date(),
                                })
                                .then((_result) => {
                                    res.status(200).json({
                                        status: "success",
                                        data: response.data,
                                    })
                                    next()
                                })
                                .catch((error) => {
                                    return next(error.message)
                                })
                        })
                        .catch((error) => {
                            res.status(JSON.parse(error.message).status).json({
                                statusText: JSON.parse(error.message).statusText,
                            })
                            next()
                        })
                }
                // data too stale - update
                if (
                    (new Date(array.head(dbData).updated_at)).getTime() <
                    Date.now() - timeUnit.minute
                ) {
                    return fetchCMC(undefined, req.params.currency)
                        .then((response) => {
                            sqlDatabase
                                .none(sql(__dirname, updateExchangeRateSQL), {
                                    data: response.data,
                                    updated_at: new Date(),
                                    currency: req.params.currency,
                                })
                                .then((_result) => {
                                    res.status(200).json({
                                        status: "success",
                                        data: response.data,
                                    })
                                    next()
                                })
                                .catch((error) => {
                                    return next(error.message)
                                })
                        })
                        .catch((error) => {
                            res.status(JSON.parse(error.message).status).json({
                                statusText: JSON.parse(error.message).statusText,
                            })
                            next()
                        })
                }
                // otherwise return stale data within 1 minute window
                res.status(200).json({
                    status: "success",
                    data: array.head(dbData).data,
                })
                next()
            })
            .catch((error) => {
                return next(error.message)
            })

}
