/**
 * Deneb.
 *
 * REST API (v2) - Account.
 *
 * @module api-v2-actions-account
 * @license Apache-2.0
 */




import StellarSdk from "stellar-sdk"
import BigNumber from "bignumber.js"
import { array } from "@xcmats/js-toolbox"
import Stripe from "stripe"
import { stripe as stripeConfig } from "../../../config/configuration.json"
import { sendAsset } from "../../../lib/helpers"




/**
 * ...
 *
 * @param {Object} sqlDatabase
 * @param {Object} rtdb
 */
export default function accountActions (rtdb) {

    // ...
    const stripe = new Stripe(stripeConfig.apiKey)




    // ...
    const fund = async (req, res, _next) => {
        try {
            let { status } = await stripe.charges.create({
                amount: req.body.charge.amount,
                currency: req.body.charge.currency,
                description: `Account Fund: ${req.body.charge.publicKeyAbbr}`,
                source: req.body.charge.token,
            })

            await sendAsset(rtdb, req.body.charge.publicKey,
                (new BigNumber(req.body.charge.amount))
                    .dividedBy(100).toString(),
                req.body.charge.currency,
                req.body.charge.token
            )

            return res.status(200).json({ status })

        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    }




    // ...
    const resubmitFund = async (req, res, _next) => {

        try {
            const prevTx = new StellarSdk.Transaction(req.body.chargeData.xdrBody)
            const destinationId = array.head(prevTx.operations).destination
            const prevTxData = (await rtdb.ref(`failedTxs/${
                destinationId}/${req.body.chargeData.id}`).once("value")).val()
            const verifiedTx = new StellarSdk.Transaction(prevTxData.xdrBody)
            const verifiedOp = array.head(verifiedTx.operations)

            await rtdb.ref(`failedTxs/${destinationId}/${
                req.body.chargeData.id}`).remove()

            await sendAsset(
                rtdb,
                verifiedOp.destination, verifiedOp.amount,
                verifiedOp.asset.code, req.body.chargeData.id
            )

            return res.status(200).json({ ok: true })
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }

    }




    return {
        fund,
        resubmitFund,
    }

}
