/**
 * Deneb.
 *
 * REST API (v2) - Account route configuration.
 *
 * @module api-v2-routes-account
 * @license Apache-2.0
 */




import { apiRootV2 } from "../../../config/env"
import accountActions from "./post"

import implodeAccount from "./actions/implode_account"


/**
 * ...
 *
 * @param {Object} app
 * @param {Object} db
 * @param {Object} rtdb
 */
export default function accountRoutes (app, db, rtdb) {

    const POST = accountActions(db, rtdb)

    // new-school
    app.post(
        `${apiRootV2}account/implode/`,
        implodeAccount(db)
    )


    // old-school
    app.post(
        `${apiRootV2}account/fund/`,
        POST.fund
    )
    app.post(
        `${apiRootV2}account/resubmit-fund/`,
        POST.resubmitFund
    )

}
