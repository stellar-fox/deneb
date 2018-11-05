/**
 * Deneb.
 *
 * REST API (v2) - Contacts route configuration.
 *
 * @module api-v2-routes-contact
 * @license Apache-2.0
 */




import { apiRootV2 } from "../../../config/env"
import contactsActions from "./post"

import listInternal from "./actions/list_internal"



/**
 * ...
 *
 * @param {Object} app
 * @param {Object} db
 */
export default function contactsRoutes (app, db) {

    const POST = contactsActions(db)


    // internal
    app.post(
        `${apiRootV2}contacts/list/internal/`,
        listInternal(db)
    )
    app.post(
        `${apiRootV2}contacts/list/requested/`,
        POST.listRequested
    )
    app.post(
        `${apiRootV2}contacts/list/pending/`,
        POST.listPending
    )
    app.post(
        `${apiRootV2}contact/remove/internal/`,
        POST.removeInternal
    )
    app.post(
        `${apiRootV2}contact/approve/internal/`,
        POST.approveInternal
    )
    app.post(
        `${apiRootV2}contact/reject/internal/`,
        POST.rejectInternal
    )
    app.post(
        `${apiRootV2}contact/unblock/internal/`,
        POST.unblockInternal
    )


    // federated
    app.post(
        `${apiRootV2}contacts/list/federated/`,
        POST.listFederated
    )
    app.post(
        `${apiRootV2}contact/update/federated/`,
        POST.updateFederated
    )
    app.post(
        `${apiRootV2}contact/remove/federated/`,
        POST.removeFederated
    )


    // common
    app.post(
        `${apiRootV2}contact/request/by-email/`,
        POST.requestByEmail
    )
    app.post(
        `${apiRootV2}contact/request/by-payment-address/`,
        POST.requestByPaymentAddress
    )
    app.post(
        `${apiRootV2}contact/request/by-account-number/`,
        POST.requestByAccountNumber
    )

}
