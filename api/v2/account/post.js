const helpers = require("../../helpers")
const stripe = require("stripe")(helpers.config.stripe.apiKey)




// ...
const fund = async (req, res, _next) => {
    try {
        let { status, } = await stripe.charges.create({
            amount: req.body.charge.amount,
            currency: req.body.charge.currency,
            description: `Account Fund: ${req.body.charge.publicKeyAbbr}`,
            source: req.body.charge.token,
        })

        return res.status(200).json({ status, })

    } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error.message)
        return res.status(500).json({ error: error.message, })
    }
}




// ...
module.exports = {
    fund,
}
