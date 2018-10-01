const
    POST = require("./post.js"),
    helpers = require("../../helpers"),
    apiRoot = helpers.apiRoot




// ...
const router = function (app) {

    // internal
    app.post(`${apiRoot}user/create/`, POST.create)
    app.post(`${apiRoot}user/subscribe-email/`, POST.subscribeEmail)
    app.post(`${apiRoot}user/unsubscribe-email/`, POST.unsubscribeEmail)
}




// ...
module.exports = router
