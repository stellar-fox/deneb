/**
 * Deneb.
 *
 * REST API (v2) - Users route configuration.
 *
 * @module api-v2-routes-users
 * @license Apache-2.0
 */




import { apiRootV2 } from "../../../config/env"
import createUser from "./actions/create_user"
import subscribeEmail from "./actions/subscribe_email"
import unsubscribeEmail from "./actions/unsubscribe_email"
import updatePassword from "./actions/update_password"




/**
 * ...
 * @function userRoutes
 * @param {Object} app
 * @param {Object} db
 * @param {Object} firebaseAdmin
 * @param {Object} firebaseApp
 * @returns {void}
 */
export default function usersRoutes (
    app, db, firebaseAdmin, firebaseApp
) {

    app.post(
        `${apiRootV2}user/create/`,
        createUser(db, firebaseAdmin, firebaseApp)
    )
    app.post(
        `${apiRootV2}user/subscribe-email/`,
        subscribeEmail()
    )
    app.post(
        `${apiRootV2}user/unsubscribe-email/`,
        unsubscribeEmail()
    )
    app.post(
        `${apiRootV2}user/update-password/`,
        updatePassword(db, firebaseApp)
    )

}
