/**
 * Deneb.
 *
 * REST API (v1) - route configuration.
 *
 * @module api-v1-routes
 * @license Apache-2.0
 */




import { apiRootV1 } from "../../config/env"
import authenticate from "./actions/authenticate"
import createAccount from "./actions/create_account"
import issueToken from "./actions/issue_token"
import latestCurrency from "./actions/latest_currency"
import addFederatedContact from "./actions/add_federated_contact"
import updateAccount from "./actions/update_account"
import userData from "./actions/user_data"
import userDataUpdate from "./actions/user_data_update"




/**
 * Deneb API (v1) configuration.
 *
 * @function configureApiV1Routes
 * @param {Object} app
 * @param {Object} db
 */
export default function configureApiV1Routes (app, db) {

    // user (v1)
    app.post(
        `${apiRootV1}user/`,
        userData(db)
    )
    app.post(
        `${apiRootV1}user/update`,
        userDataUpdate(db)
    )
    app.post(
        `${apiRootV1}user/authenticate/`,
        authenticate(db)
    )
    app.post(
        `${apiRootV1}user/ledgerauth/:pubkey/:path/`,
        issueToken(db)
    )

    // ticker (v1)
    app.get(
        `${apiRootV1}ticker/latest/:currency/`,
        latestCurrency(db)
    )

    // account (v1)
    app.post(
        `${apiRootV1}account/create/`,
        createAccount(db)
    )
    app.post(
        `${apiRootV1}account/update/`,
        updateAccount(db)
    )

    // contact (v1)
    app.post(
        `${apiRootV1}contact/addext/`,
        addFederatedContact(db)
    )

}
