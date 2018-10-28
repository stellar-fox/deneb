import { apiRootV2 } from "../../../config/env"
import accountActions from "./post"




//
// accountRoutes
//
export default function accountRoutes (app, db, rtdb) {

    const POST = accountActions(db, rtdb)

    app.post(
        `${apiRootV2}account/implode/`,
        POST.implode
    )
    app.post(
        `${apiRootV2}account/fund/`,
        POST.fund
    )
    app.post(
        `${apiRootV2}account/resubmit-fund/`,
        POST.resubmitFund
    )

}
