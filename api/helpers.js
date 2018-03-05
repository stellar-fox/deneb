/**
 * Holds regular expression used to check the validity of Stellar Federation
 * address string.
 */
const regexpFederationFormat = new RegExp([
    /^([a-zA-Z\-0-9.@]+)\*/,
    /((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
].map(r => r.source).join(""))


/**
 * Holds regular expression used to check the validity of the alias part of
 * Stellar Federation address format.
 */
const regexpFedAliasFormat = new RegExp(
    /^[a-zA-Z\-0-9.@]+$/
)


/**
 * Holds regular expression used to check the validity of the domain format.
 */
const regexpDomainFormat = new RegExp(
    /^(\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})$/
)


/**
 * This function checks the validity of email address format.
 * @param {String} email
 * @returns {Boolean}
 */
const emailIsValid = (email) => !!(
    new RegExp([
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))/,
        /@/,
        regexpDomainFormat,
    ].map(r => r.source).join(""))
).test(email)


/**
 * This function checks the validity of password.
 * @param {String} email
 * @returns {Boolean}
 */
const passwordIsValid = (password) => !!/^.{8,}$/.test(password)


/**
 * This helper function converts numerical return code from database and
 * translates it to standard HTTP return code.
 * @param {Integer} dbRetCode 
 */
const codeToHttpRet = (dbRetCode) => (
    (c) => c[Object.keys(c).filter((key) => key === dbRetCode.toString())] || 500
)({
    "0": 401,
    "23505": 409,
})


/**
 * This function validates the format of Stellar Federation address string.
 * @param {String} address Stellar Federation address.
 * @returns {Boolean}
 */
const federationAddressIsValid = (address) => !!(
    new RegExp([
        /^[a-zA-Z\-0-9.@]+\*/,
        regexpDomainFormat,
    ].map(r => r.source).join(""))
).test(address)


/**
 * This function returns alias part of Stellar Federation address.
 * @param {String} alias Stellar Federation address.
 * @returns {String} alias part of Stellar Federation address.
 */
const getFedAlias = (alias) => (
    (match) => (match ? match[0] : null)
)(alias.match(regexpFedAliasFormat))


/**
 * This function returns domain part of Stellar Federation address.
 * @param {String} domain Stellar Federation address.
 * @returns {String} domain part of Stellar Federation address.
 */
const getFedDomain = (domain) => (
    (match) => (match ? match[0] : null)
)(domain.match(regexpDomainFormat))


// const compare = (a,b) => (
//     (b) => bcrypt.compareSync(a, b)
// )(b)



// ...
// const errorMessageToRetCode = function (message) {
//     let errorCode = null
//     switch (true) {
//         case (message.match(/duplicate key/) !== null):
//             errorCode = 409
//             break
    
//         default:
//             errorCode = 500
//             break
//     }
//     return errorCode
// }

// ...
const btoh = (bcryptHash) => (
    new Buffer(bcryptHash, "ascii").toString("hex")
)


// ...
const htob = (hexString) => (
    new Buffer(hexString, "hex").toString("ascii")
)


// ...
// const apiKeyValid = function (hashedApiKey) {
//     return bcrypt.compareSync(config.attributes.apiKey, hashedApiKey)
// }


// ...
// const fetchCMC = function (base='stellar', quot='eur') {
//   return axios.get(`https://api.coinmarketcap.com/v1/ticker/${base}/?convert=${quot}`)
//     .then((response) => {
//       return {
//         data: response.data[0],
//       }
//     })
//     .catch((error) => {
//       throw new Error(JSON.stringify({
//         status: error.response.status,
//         statusText: error.response.statusText,
//       }))
//     })
// }


// ...
// const tokenIsValid = function(token, userId) {
//   const tokenASCII = new Buffer(token, 'base64').toString('ascii')
//   return bcrypt.compareSync(`${config.attributes.apiKey}${userId}`, tokenASCII)
// }


// ...
// const getApiKey = function() {
//   return config.attributes.apiKey
// }


// ...
module.exports = {
//   fetchCMC: fetchCMC,
    // db: db,
    // tokenIsValid: tokenIsValid,
    // getApiKey: getApiKey,
    // apiKeyValid,
    emailIsValid,
    passwordIsValid,
    btoh,
    htob,
    // errorMessageToRetCode,
    codeToHttpRet,
    regexpFederationFormat,
    federationAddressIsValid,
    getFedAlias,
    getFedDomain,
    // compare,
}
