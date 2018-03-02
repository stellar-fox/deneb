const JWS = require("jws")
const db = require("../lib/db.js")



const signature = (payload, secret) => JWS.sign({
    header: {alg: "HS256",},
    payload,
    secret,
})



const tokenIsValid = async (token) => {
    const decodedToken = JWS.decode(token)
    try {
        const row = await db.one("SELECT * FROM users WHERE id = ${id}", {
            id: decodedToken.payload,
        })
        return JWS.verify(token, decodedToken.header.alg, row.password_digest) ? decodedToken.payload : false
    } catch (error) {
        return false
    }
}



module.exports = {
    signature,
    tokenIsValid,
}