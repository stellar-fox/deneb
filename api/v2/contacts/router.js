const POST = require("./post.js"),
    helpers = require("../../helpers"),
    apiRoot = helpers.apiRoot




// ...
const router = function (app) {
    // internal
    app.post(`${apiRoot}contacts/list/internal/`, POST.listInternal)
    app.post(`${apiRoot}contacts/list/requested/`, POST.listRequested)
    app.post(`${apiRoot}contacts/list/pending/`, POST.listPending)
    app.post(`${apiRoot}contact/remove/internal/`, POST.removeInternal)
    app.post(`${apiRoot}contact/approve/internal/`, POST.approveInternal)
    app.post(`${apiRoot}contact/reject/internal/`, POST.rejectInternal)
    app.post(`${apiRoot}contact/unblock/internal/`, POST.unblockInternal)

    // federated
    app.post(`${apiRoot}contacts/list/federated/`, POST.listFederated)
    app.post(`${apiRoot}contact/update/federated/`, POST.updateFederated)
    app.post(`${apiRoot}contact/remove/federated/`, POST.removeFederated)

    // common
    app.post(
        `${apiRoot}contact/request/by-payment-address/`,
        POST.requestByPaymentAddress
    )
    app.post(
        `${apiRoot}contact/request/by-account-number/`,
        POST.requestByAccountNumber
    )
}




// ...
module.exports = router
