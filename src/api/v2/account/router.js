const
    POST = require("./post.js"),
    helpers = ("../../../lib/helpers"),
    apiRoot = helpers.apiRoot




// ...
const router = function (app) {
    app.post(`${apiRoot}account/implode/`, POST.implode)
    app.post(`${apiRoot}account/fund/`, POST.fund)
    app.post(`${apiRoot}account/resubmit-fund/`, POST.resubmitFund)
}




// ...
module.exports = router
