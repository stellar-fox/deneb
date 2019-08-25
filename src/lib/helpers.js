/**
 * Deneb.
 *
 * App-specific helper functions.
 *
 * @module helpers
 * @license Apache-2.0
 */




import axios from "axios"
import bcrypt from "bcryptjs"
import { array } from "@xcmats/js-toolbox"
import { apiKey } from "../config/configuration.json"




/**
 * @constant
 * @type {Object}
 * @property {String} status Approval status of a contact
 */
export const contactStatusCodes = {
    REQUESTED   : 1,
    APPROVED    : 2,
    BLOCKED     : 3,
    DELETED     : 4,
    PENDING     : 5,
}




/**
 * ...
 *
 * @function errorMessageToRetCode
 * @param {String} message
 */
export const errorMessageToRetCode = (message) => {
    let errorCode = null
    switch (true) {
        case (message.match(/duplicate key/) !== null):
            errorCode = 409
            break

        default:
            errorCode = 500
            break
    }
    return errorCode
}




/**
 * ...
 *
 * @async
 * @function fetchCMC
 * @param {*} base
 * @param {*} quot
 */
export const fetchCMC = (base = "stellar", quot = "eur") =>
    axios.get(`https://api.coinmarketcap.com/v1/ticker/${base}/?convert=${quot}`)
        .then((response) => {
            return { data: array.head(response.data) }
        })
        .catch((error) => {
            throw new Error(JSON.stringify({
                status: error.response.status,
                statusText: error.response.statusText,
            }))
        })




/**
 * ...
 *
 * @function getApiKey
 */
export const getApiKey = () => apiKey




/**
 * ...
 *
 * @function tokenIsValid
 * @param {*} token
 * @param {*} userId
 */
export const tokenIsValid = (token, userId) =>
    bcrypt.compareSync(
        `${getApiKey()}${userId}`,
        Buffer.from(token, "base64").toString("ascii")
    )
