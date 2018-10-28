import { apiRootV2 } from "../../../config/env"
import usersActions from "./post"




//
// usersRoutes
//
export default function usersRoutes (app, db, firebaseAdmin, firebaseApp) {

    const POST = usersActions(db, firebaseAdmin, firebaseApp)

    //
    // internal
    //
    app.post(
        `${apiRootV2}user/create/`,
        POST.create
    )
    app.post(
        `${apiRootV2}user/subscribe-email/`,
        POST.subscribeEmail
    )
    app.post(
        `${apiRootV2}user/unsubscribe-email/`,
        POST.unsubscribeEmail
    )

}
