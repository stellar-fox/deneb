/**
 * Deneb.
 *
 * App-specific helper functions.
 *
 * @module helpers
 * @license Apache-2.0
 */




import axios from "axios"
import bcrypt from "bcrypt"
import { array } from "@xcmats/js-toolbox"
import {
    apiKey,
    stellar as stellarConfig,
} from "../config/configuration.json"
import {
    Asset,
    Keypair,
    Memo,
    Network,
    Operation,
    Server,
    TransactionBuilder,
} from "stellar-sdk"




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




// ...
export const sendAsset = (
    rtdb, destinationId,
    amount, currency,
    payToken
) => {

    Network.useTestNetwork()
    const server = new Server(stellarConfig.horizon)
    const sourceKeys = Keypair.fromSecret(
        stellarConfig.distributionSecret
    )
    let transaction = null

    return server.loadAccount(sourceKeys.publicKey())
        .then((sourceAccount) => {
            transaction = new TransactionBuilder(sourceAccount)
                .addOperation(Operation.payment({
                    destination: destinationId,
                    asset: new Asset(
                        currency.toUpperCase(),
                        stellarConfig.issuingPublic
                    ),
                    amount,
                }))
                .addMemo(Memo.text(stellarConfig.distMemo))
                .build()
            transaction.sign(sourceKeys)
            return server.submitTransaction(transaction)
        })
        .catch(function (error) {
            /**
             * Store transaction envelope that could not be submitted
             */
            rtdb.ref(`failedTxs/${destinationId}/${payToken}`).set({
                amount,
                currency,
                xdrBody: transaction.toEnvelope().toXDR().toString("base64"),
                submitted: false,
                retries: 0,
                lastAttempt: (new Date().getTime()),
                reason: error.response.data.extras.result_codes,
            })

            // eslint-disable-next-line no-console
            console.log(error.response.data.extras.result_codes)
        })
}
