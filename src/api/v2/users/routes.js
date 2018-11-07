/**
 * Deneb.
 *
 * REST API (v2) - Users route configuration.
 *
 * @module api-v2-routes-users
 * @license Apache-2.0
 */




import { apiRootV2 } from "../../../config/env"
import usersActions from "./post"

import createUser from "./actions/create_user"




/**
 * ...
 *
 * @param {Object} app
 * @param {Object} db
 * @param {Object} firebaseAdmin
 * @param {Object} firebaseApp
 */
export default function usersRoutes (
    app, db, firebaseAdmin, firebaseApp
) {

    const POST = usersActions(db, firebaseAdmin, firebaseApp)

    // internal
    app.post(
        `${apiRootV2}user/create/`,
        createUser(db, firebaseAdmin, firebaseApp)
    )
    app.post(
        `${apiRootV2}user/subscribe-email/`,
        POST.subscribeEmail
    )
    app.post(
        `${apiRootV2}user/unsubscribe-email/`,
        POST.unsubscribeEmail
    )

}
