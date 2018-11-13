/**
 * Deneb.
 *
 * 'Resubmit fund with Stripe' action.
 *
 * @module actions
 * @license Apache-2.0
 */




import { array } from "@xcmats/js-toolbox"
import { sendAsset } from "../../../../lib/helpers"
import { Transaction } from "stellar-sdk"
import { stellar as stellarConfig } from "../../../../config/configuration"




/**
 * ...
 *
 * @function resubmitFundWithStripe
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function resubmitFundWithStripe (rtdb) {

    return async (req, res, next) => {
        try {
            const prevTx = new Transaction(req.body.chargeData.xdrBody)
            const destinationId = array.head(prevTx.operations).destination
            const prevTxData = (await rtdb.ref(`failedTxs/${
                destinationId}/${req.body.chargeData.id}`).once("value")).val()
            const verifiedTx = new Transaction(prevTxData.xdrBody)
            const verifiedOp = array.head(verifiedTx.operations)

            await rtdb.ref(`failedTxs/${destinationId}/${
                req.body.chargeData.id}`).remove()

            await sendAsset(
                rtdb,
                verifiedOp.destination, verifiedOp.amount,
                verifiedOp.asset.code, req.body.chargeData.id,
                stellarConfig.networkPassphrase
            )

            res.status(200).json({ ok: true })
            next()
        } catch (error) {
            res.status(500).json({ error: error.message })
            next()
        }
    }

}
