const POST = require("./post.js")




// ...
const router = function (app) {
    // internal
    app.post("/api/v2/contacts/list/internal/", POST.listInternal)
    app.post("/api/v2/contacts/list/requested/", POST.listRequested)
    app.post("/api/v2/contacts/list/pending/", POST.listPending)
    app.post("/api/v2/contact/remove/internal/", POST.removeInternal)
    app.post(
        "/api/v2/contact/request/internal/by-payment-address/",
        POST.requestInternalByPaymentAddress
    )
    app.post("/api/v2/contact/approve/internal/", POST.approveInternal)
    app.post("/api/v2/contact/reject/internal/", POST.rejectInternal)

    // federated
    app.post("/api/v2/contacts/list/federated/", POST.listFederated)
    app.post("/api/v2/contact/update/federated/", POST.updateFederated)
    app.post("/api/v2/contact/remove/federated/", POST.removeFederated)
}




// ...
module.exports = router