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


/**
 * This function encodes ascii string into a base64 string.
 * @param {String} bcryptHash contains the ascii result of bcrypt.hash() operation.
 * @returns {String} base64 encoded input.
 */
const btoh = (bcryptHash) => (
    new Buffer(bcryptHash, "ascii").toString("base64")
)


/**
 * This function decodes base64 string into ascii.
 * @param {String} hexString contains the base64 representation of bcrypt.hash() result.
 * @returns {String} ascii representation of bcrypt.hash() result.
 */
const htob = (hexString) => (
    new Buffer(hexString, "base64").toString("ascii")
)


// ...
module.exports = {
    emailIsValid,
    passwordIsValid,
    btoh,
    htob,
    codeToHttpRet,
    regexpFederationFormat,
    federationAddressIsValid,
    getFedAlias,
    getFedDomain,
}
