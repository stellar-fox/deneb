/**
 * Deneb.
 *
 * 'Create user' action.
 *
 * @module actions
 * @license Apache-2.0
 */




import bcrypt from "bcryptjs"
import { sql } from "../../../../lib/utils"
import selectUser from "./select_user.sql"
import insertUserSQL from "./insert_user.sql"




/**
 * ...
 *
 * @function insertUser
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function insertUser (sqlDatabase, firebaseAdmin, firebaseApp) {

    return async (req, res, next) => {

        const now = new Date()

        try {

            const uid = (
                await firebaseAdmin.auth()
                    .verifyIdToken(req.body.token)
            ).uid

            await firebaseApp.auth().signInWithEmailAndPassword(
                req.body.email, req.body.password,
            )

            if (uid !== firebaseApp.auth().currentUser.uid) {
                return res.status(403).json({ error: "Forbidden." })
            }

            const userAlreadyExists = await sqlDatabase.oneOrNone(
                sql(__dirname, selectUser), {
                    uid: firebaseApp.auth().currentUser.uid,
                }
            )

            if (!userAlreadyExists) {
                const password_digest = await bcrypt.hash(req.body.password, 10)
                const userCreateResp = await sqlDatabase.one(
                    sql(__dirname, insertUserSQL),
                    {
                        email: req.body.email,
                        uid: firebaseApp.auth().currentUser.uid,
                        password_digest,
                        created_at: now,
                        updated_at: now,
                    }
                )
                res.status(201).json({ userid: userCreateResp.id })
                next()
            }

            res.status(204).send()
            next()

        } catch (_error) {
            res.status(401).send()
            next()
        }

    }

}
