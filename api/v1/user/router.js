// ...
const POST = require("./post.js"),
    helpers = require("../../helpers"),
    apiVersion = helpers.apiVersion




// ...
const router = function (app) {
    app.post(`${apiVersion}user/auth/`, POST.auth)
}




// ...
module.exports = router