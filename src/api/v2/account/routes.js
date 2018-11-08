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
import fundWithStripe from "./actions/fund_with_stripe"
import resubmitFundWithStripe from "./actions/resubmit_fund_with_stripe"




/**
 * ...
 *
 * @param {Object} app
 * @param {Object} db
 * @param {Object} rtdb
 */
export default function accountRoutes (app, db, rtdb, stripe) {

    app.post(
        `${apiRootV2}account/implode/`,
        implodeAccount(db)
    )

    app.post(
        `${apiRootV2}account/fund/`,
        fundWithStripe(rtdb, stripe)
    )

    app.post(
        `${apiRootV2}account/resubmit-fund/`,
        resubmitFundWithStripe(rtdb)
    )

}
