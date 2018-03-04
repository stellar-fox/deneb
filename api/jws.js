const JWS = require("jws")
const db = require("../lib/db.js")



const signature = (payload, secret) => JWS.sign({
    header: {alg: "HS256",},
    payload,
    secret,
})



const tokenIsValid = async (token) => {
    try {
        const decoded = JWS.decode(token)
        const payload = JSON.parse(decoded.payload)
        if (payload.expires < new Date().getTime()) {
            return false
        }
        const row = await db.one("SELECT * FROM users WHERE id = ${id}", {
            id: payload.userId,
        })
        return JWS.verify(token, decoded.header.alg, row.password_digest) ?
            payload.userId : false
    } catch (error) {
        return false
    }
}



module.exports = {
    signature,
    tokenIsValid,
}