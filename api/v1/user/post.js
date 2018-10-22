const helpers = require("../../helpers")




// ...
const auth = async (req, res, _next) => {
    try {
        const uid = (await helpers.firebaseAdmin.auth()
            .verifyIdToken(req.body.token)).uid
        return res.status(200).json({ uid, })
    } catch (error) {
        if (error.code == "auth/id-token-revoked") {
            return res.status(401).json({
                reason: "Token has been revoked. You may need to reauthenticate.",
            })
        }
        if (error.code == "auth/argument-error") {
            return res.status(401).json({ reason: error.message, })
        }
        else {
            return res.status(401).json({ reason: "Token is invalid.", })
        }
    }
}




// ...
module.exports = {
    auth,
}
