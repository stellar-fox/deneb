const POST = require("./post.js")

const router = function (app) {
    app.get("/api/v2/contacts/", POST.root)
    app.post("/api/v2/contacts/list/", POST.list)
}


module.exports = router