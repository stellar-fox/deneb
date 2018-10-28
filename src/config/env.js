/**
 * Deneb.
 *
 * Environment variables.
 *
 * @module env
 * @license Apache-2.0
 */




/**
 * @constant port Default http port.
 */
export const port = 4001




/**
 * @constant whiteList Token-validity-check-prevention list.
 */
export const whiteList = [
    "^/$",
    "^/api/?$",
    "^/api/v1/?$",
    "^/api/v2/?$",
    "^/api/v2/user/create/?$",
    "^/api/v1/account/create/?$",
    "^/favicon.ico/?$",
    "^/api/v1/user/authenticate/?$",
    "^/api/v1/ticker/latest/[a-z]{3}/?$",
    "^/api/v1/user/ledgerauth/[A-Z0-9]{56}/[0-9]{1,}/?$",
]




/**
 * @constant apiRoot Current API prefix (versioned).
 */
export const apiRoot = "/api/v2/"
