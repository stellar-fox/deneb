const JWS = require("jws")
const db = require("../lib/db.js")


/**
 * 
 * @param {String} payload representation of JSON payload
 * @param {String} secret signature used to sign the JWT
 * @returns {String} JWT in format xxx.yy.zzz
 */
const signature = (payload, secret) => JWS.sign({
    header: {alg: "HS256",},
    payload,
    secret,
})


/**
 * This function checks the validity of the token and returns user id from
 * token's payload with prior verification of token integrity and signature
 * validity.
 * @param {String} token Base64 encoded String xxx.yy.zzz representation of JWT
 * @returns {Number} any positive integer when user is found in database or 0
 */
const getUserIdFromToken = async (token) => {
    try {
        const decoded = JWS.decode(token)
        const payload = JSON.parse(decoded.payload)
        if (payload.expires < new Date().getTime()) {
            return 0
        }
        const row = await db.one("SELECT * FROM users WHERE id = ${id}", {
            id: payload.userId,
        })
        return JWS.verify(token, decoded.header.alg, row.password_digest) ?
            payload.userId : 0
    } catch (error) {
        return 0
    }
}


module.exports = {
    signature,
    getUserIdFromToken,
}