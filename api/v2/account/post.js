const helpers = require("../../helpers")
const stripe = require("stripe")(helpers.config.stripe.apiKey)
const StellarSdk = require("stellar-sdk")
const BigNumber = require("bignumber.js")




// ...
const sendAsset = (destinationId, amount) => {

    StellarSdk.Network.useTestNetwork()
    const server = new StellarSdk.Server(helpers.config.stellar.horizon)
    var sourceKeys = StellarSdk.Keypair.fromSecret(helpers.config.stellar.distributionSecret)

    server.loadAccount(sourceKeys.publicKey())
        .then((sourceAccount) => {
            const transaction = new StellarSdk.TransactionBuilder(sourceAccount)
                .addOperation(StellarSdk.Operation.payment({
                    destination: destinationId,
                    asset: new StellarSdk.Asset(
                        helpers.config.stellar.assetCode,
                        helpers.config.stellar.issuingPublic
                    ),
                    amount,
                }))
                // Use the memo to indicate the customer this payment is intended for.
                .addMemo(StellarSdk.Memo.text(helpers.config.stellar.distMemo))
                .build()
            transaction.sign(sourceKeys)
            return server.submitTransaction(transaction)
        })
        .catch(function (error) {
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
                .dividedBy(100).toString()
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
