const db = require("./db.js")
const Axios = require("axios")

/**
 * This function will try to get the current rate from database.
 * @param {String} currency ISO-4217 code representing given currency.
 * @returns {Object} contains rate information or is empty when rate was not found.
 */
const getRate = async (currency) => (
    (row) => (row.length !== 0 ? row : {})
)(await db.any(
    "SELECT * FROM ticker WHERE currency = ${currency}", { currency, })
)


/**
 * This function checks wheather the exchange rate stored in database is stale.
 * @param {Object} rate exchange rate information as JSON object.
 * @returns {Boolean}
 */
const fxIsStale = async (rate) => (
    () => (
        new Date(rate.updated_at).getTime() -
        (new Date().getTime() - 60000) < 0
    ) ? true : false
)(rate)


/**
 * This function fetches the live rate from Coinmarketcap.com via their public API.
 * @param {String} base represents base currency.
 * @param {String} quot represents quoting currency.
 * @returns {String} current exchange rate.
 */
const fetchRate = async (base, quot) => (
    async (base, quot) => {
        try {
            return (await Axios.get(`https://api.coinmarketcap.com/v1/ticker/${base}/?convert=${quot}`))
        } catch (error) {
            return "0.00000"
        }
    }

)(base, quot)


module.exports = {
    getRate,
    fxIsStale,
    fetchRate,
}