/**
 * Deneb.
 *
 * REST API (v1) - route configuration.
 *
 * @module api-v1-routes
 * @license Apache-2.0
 */




import { apiRootV1 } from "../../config/env"

// new-school
import authenticate from "./actions/authenticate"

// old-style "bulk" imports
import getApiV1Actions from "./get"
import postApiV1Actions from "./post"




/**
 * Deneb API (v1) configuration.
 *
 * @function configureApiV1Routes
 * @param {Object} app
 * @param {Object} db
 */
export default function configureApiV1Routes (app, db) {

    const
        GET = getApiV1Actions(db),
        POST = postApiV1Actions(db)


    // new-school
    app.post(
        `${apiRootV1}user/authenticate/`,
        authenticate(db)
    )


    // old-style
    app.get(
        `${apiRootV1}ticker/latest/:currency/`,
        GET.latestCurrency
    )
    app.post(
        `${apiRootV1}account/update/`,
        POST.updateAccount
    )
    app.post(
        `${apiRootV1}account/create/`,
        POST.createAccount
    )
    app.post(
        `${apiRootV1}contacts/`,
        POST.contacts
    )
    app.post(
        `${apiRootV1}contacts/external/`,
        POST.externalContacts
    )
    app.post(
        `${apiRootV1}contact/update/`,
        POST.updateContact
    )
    app.post(
        `${apiRootV1}contact/delete/`,
        POST.deleteContact
    )
    app.post(
        `${apiRootV1}contact/extupdate/`,
        POST.updateExtContact
    )
    app.post(
        `${apiRootV1}contact/extdelete/`,
        POST.deleteExtContact
    )
    app.post(
        `${apiRootV1}contact/request/`,
        POST.requestContact
    )
    app.post(
        `${apiRootV1}contact/reqbyacct/`,
        POST.requestContactByAccountNumber
    )
    app.post(
        `${apiRootV1}contact/reqlist/`,
        POST.contactReqlist
    )
    app.post(
        `${apiRootV1}contact/addext/`,
        POST.addExtContact
    )
    app.post(
        `${apiRootV1}user/`,
        POST.userData
    )
    app.post(
        `${apiRootV1}user/update/`,
        POST.updateUser
    )
    app.post(
        `${apiRootV1}user/create/`,
        POST.createUser
    )
    app.post(
        `${apiRootV1}user/ledgerauth/:pubkey/:path/`,
        POST.issueToken
    )

}
