const POST = require("./post.js"),
    helpers = require("../../helpers"),
    apiRoot = helpers.apiRoot




// ...
const router = function (app) {

    // internal
    app.post(`${apiRoot}user/create/`, POST.create)
    app.post(`${apiRoot}user/subscribe-email/`, POST.subscribeEmail)
}




// ...
module.exports = router
