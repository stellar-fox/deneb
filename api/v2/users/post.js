const
    helpers = require("../../helpers"),
    config = require("../../../config"),
    firebase = require("firebase/app")

require("firebase/auth")

const firebaseApp = firebase.initializeApp(config.attributes.firebase)




// ...
const create = async (req, res, _next) => {

    const now = new Date()
    try {

        await firebaseApp.auth().signInWithEmailAndPassword(
            req.body.username,
            req.body.password,
        )

        const userAlreadyExists = await helpers.db.oneOrNone(
            "SELECT uid FROM users WHERE uid = ${uid}", {
                uid: firebaseApp.auth().currentUser.uid,
            }
        )

        if (!userAlreadyExists) {
            await helpers.db.none(
                "INSERT INTO users(uid, created_at, updated_at) \
                VALUES(${uid}, ${created_at}, ${updated_at})",
                {
                    uid: firebaseApp.auth().currentUser.uid,
                    created_at: now,
                    updated_at: now,
                }
            )
            return res.status(201).send()
        }
        return res.status(204).send()
    } catch (error) {
        return res.status(401).send()
    }
}




// ...
module.exports = {
    create,
}
