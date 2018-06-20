const POST = require("./post.js"),
    helpers = require("../../helpers"),
    apiRoot = helpers.apiRoot




// ...
const router = function (app) {

    // internal
    app.post(`${apiRoot}users/create/`, POST.create)
}




// ...
module.exports = router
