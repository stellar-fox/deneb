const POST = require("./post.js"),
    helpers = require("../../helpers"),
    apiRoot = helpers.apiRoot




// ...
const router = function (app) {
    app.post(`${apiRoot}account/fund/`, POST.fund)
}




// ...
module.exports = router
