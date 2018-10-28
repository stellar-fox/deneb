import {
    array,
    timeUnit,
} from "@xcmats/js-toolbox"
import { fetchCMC } from "../../lib/helpers"




// ...
export default function getApiV1Actions (sqlDatabase) {

    // ...
    const latestCurrency = (req, res, next) => {
        sqlDatabase
            .any("SELECT * FROM ticker WHERE currency = ${currency}", {
                currency: req.params.currency,
            })
            .then((dbData) => {
                // no data available - update
                if (dbData.length === 0) {
                    return fetchCMC(undefined, req.params.currency)
                        .then((response) => {
                            sqlDatabase
                                .none(
                                    "INSERT INTO " +
                                        "ticker(currency, data, updated_at) " +
                                        "VALUES(${currency}, ${data}, ${updated_at})",
                                    {
                                        currency: req.params.currency,
                                        data: response.data,
                                        updated_at: new Date(),
                                    }
                                )
                                .then((_result) => {
                                    res.status(200).json({
                                        status: "success",
                                        data: response.data,
                                    })
                                })
                                .catch((error) => {
                                    return next(error.message)
                                })
                        })
                        .catch((error) => {
                            res.status(JSON.parse(error.message).status).json({
                                statusText: JSON.parse(error.message).statusText,
                            })
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
                                .none(
                                    "UPDATE ticker SET " +
                                        "data = $1, " +
                                        "updated_at = $2 " +
                                    "WHERE currency = $3",
                                    [
                                        response.data,
                                        new Date(),
                                        req.params.currency,
                                    ]
                                )
                                .then((_result) => {
                                    res.status(200).json({
                                        status: "success",
                                        data: response.data,
                                    })
                                })
                                .catch((error) => {
                                    return next(error.message)
                                })
                        })
                        .catch((error) => {
                            res.status(JSON.parse(error.message).status).json({
                                statusText: JSON.parse(error.message).statusText,
                            })
                        })
                }
                // otherwise return stale data within 1 minute window
                res.status(200).json({
                    status: "success",
                    data: array.head(dbData).data,
                })
            })
            .catch((error) => {
                return next(error.message)
            })
    }




    return {
        latestCurrency,
    }

}
