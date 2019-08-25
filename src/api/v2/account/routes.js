/**
 * Deneb.
 *
 * REST API (v2) - Account route configuration.
 *
 * @module api-v2-routes-account
 * @license Apache-2.0
 */




import { apiRootV2 } from "../../../config/env"
import implodeAccount from "./actions/implode_account"




/**
 * ...
 * @function accountRoutes
 * @param {Object} app
 * @param {Object} db
 * @param {Object} rtdb
 * @returns {void}
 */
export default function accountRoutes (app, db) {

    app.post(
        `${apiRootV2}account/implode/`,
        implodeAccount(db)
    )

}
