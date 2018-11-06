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

import approveInternal from "./actions/approve_internal"
import listInternal from "./actions/list_internal"
import listPending from "./actions/list_pending"
import listRequested from "./actions/list_requested"
import rejectInternal from "./actions/reject_internal"
import removeInternal from "./actions/remove_internal"
import unblockInternal from "./actions/unblock_internal"




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
        listRequested(db)
    )
    app.post(
        `${apiRootV2}contacts/list/pending/`,
        listPending(db)
    )
    app.post(
        `${apiRootV2}contact/remove/internal/`,
        removeInternal(db)
    )
    app.post(
        `${apiRootV2}contact/approve/internal/`,
        approveInternal(db)
    )
    app.post(
        `${apiRootV2}contact/reject/internal/`,
        rejectInternal(db)
    )
    app.post(
        `${apiRootV2}contact/unblock/internal/`,
        unblockInternal(db)
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
