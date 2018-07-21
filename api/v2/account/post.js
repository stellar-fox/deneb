const helpers = require("../../helpers")
const stripe = require("stripe")(helpers.config.stripe.apiKey)
const StellarSdk = require("stellar-sdk")
const BigNumber = require("bignumber.js")


// ...
const sendAsset = (destinationId, amount, currency, payToken) => {

    StellarSdk.Network.useTestNetwork()
    const server = new StellarSdk.Server(helpers.config.stellar.horizon)
    const sourceKeys = StellarSdk.Keypair.fromSecret(
        helpers.config.stellar.distributionSecret
    )
    let transaction = null

    return server.loadAccount(sourceKeys.publicKey())
        .then((sourceAccount) => {
            transaction = new StellarSdk.TransactionBuilder(sourceAccount)
                .addOperation(StellarSdk.Operation.payment({
                    destination: destinationId,
                    asset: new StellarSdk.Asset(
                        currency.toUpperCase(),
                        helpers.config.stellar.issuingPublic
                    ),
                    amount,
                }))
                .addMemo(StellarSdk.Memo.text(helpers.config.stellar.distMemo))
                .build()
            transaction.sign(sourceKeys)
            return server.submitTransaction(transaction)
        })
        .catch(function (error) {
            /**
             * Store transaction envelope that could not be submitted
             */
            helpers.rtdb.ref(`failedTxs/${destinationId}/${payToken}`).set({
                amount,
                currency,
                xdrBody: transaction.toEnvelope().toXDR().toString("base64"),
                submitted: false,
                retries: 0,
                lastAttempt: (new Date().getTime()),
            })

            // eslint-disable-next-line no-console
            console.log(error.response.data.extras.result_codes)
        })
}



// ...
const fund = async (req, res, _next) => {
    try {
        let { status, } = await stripe.charges.create({
            amount: req.body.charge.amount,
            currency: req.body.charge.currency,
            description: `Account Fund: ${req.body.charge.publicKeyAbbr}`,
            source: req.body.charge.token,
        })

        await sendAsset(req.body.charge.publicKey,
            (new BigNumber(req.body.charge.amount))
                .dividedBy(100).toString(),
            req.body.charge.currency,
            req.body.charge.token
        )

        return res.status(200).json({ status, })

    } catch (error) {
        return res.status(500).json({ error: error.message, })
    }
}




// ...
module.exports = {
    fund,
}
