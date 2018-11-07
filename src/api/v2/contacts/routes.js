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
import listFederated from "./actions/list_federated"
import listInternal from "./actions/list_internal"
import listPending from "./actions/list_pending"
import listRequested from "./actions/list_requested"
import rejectInternal from "./actions/reject_internal"
import removeFederated from "./actions/remove_federated"
import removeInternal from "./actions/remove_internal"
import requestByEmail from "./actions/request_by_email"
import unblockInternal from "./actions/unblock_internal"
import updateFederated from "./actions/update_federated"




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
        listFederated(db)
    )
    app.post(
        `${apiRootV2}contact/update/federated/`,
        updateFederated(db)
    )
    app.post(
        `${apiRootV2}contact/remove/federated/`,
        removeFederated(db)
    )


    // common
    app.post(
        `${apiRootV2}contact/request/by-email/`,
        requestByEmail(db)
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
