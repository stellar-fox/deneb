/**
 * Deneb.
 *
 * 'Fund with Stripe' action.
 *
 * @module actions
 * @license Apache-2.0
 */




import BigNumber from "bignumber.js"
import { sendAsset } from "../../../../lib/helpers"




/**
 * ...
 *
 * @function fundWithStripe
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function fundWithStripe (rtdb, stripe) {

    return async (req, res, next) => {
        try {
            let { status } = await stripe.charges.create({
                amount: req.body.charge.amount,
                currency: req.body.charge.currency,
                description: `Account Fund: ${req.body.charge.publicKeyAbbr}`,
                source: req.body.charge.token,
            })

            await sendAsset(
                rtdb,
                req.body.charge.publicKey,
                (new BigNumber(req.body.charge.amount))
                    .dividedBy(100).toString(),
                req.body.charge.currency,
                req.body.charge.token
            )

            res.status(200).json({ status })
            next()

        } catch (error) {
            res.status(500).json({ error: error.message })
            next()
        }
    }

}
