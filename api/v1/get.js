const
    helpers = require("../helpers.js"),
    toolbox = require("@xcmats/js-toolbox")




// ...
function latestCurrency (req, res, next) {
    helpers.db
        .any("SELECT * FROM ticker WHERE currency = ${currency}", {
            currency: req.params.currency,
        })
        .then((dbData) => {
            // no data available - update
            if (dbData.length === 0) {
                return helpers
                    .fetchCMC(undefined, req.params.currency)
                    .then((response) => {
                        helpers.db
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
                (new Date(toolbox.head(dbData).updated_at)).getTime() <
                Date.now() - toolbox.timeUnit.minute
            ) {
                return helpers
                    .fetchCMC(undefined, req.params.currency)
                    .then((response) => {
                        helpers.db
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
                data: toolbox.head(dbData).data,
            })
        })
        .catch((error) => {
            return next(error.message)
        })
}




// ...
module.exports = {
    latestCurrency: latestCurrency,
}
