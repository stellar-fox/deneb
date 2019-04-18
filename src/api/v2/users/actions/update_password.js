/**
 * Deneb.
 *
 * 'Update password' action.
 *
 * @module users-actions
 * @license Apache-2.0
 */




import bcrypt from "bcryptjs"
import { sql } from "../../../../lib/utils"
import updatePasswordSQL from "./update_password.sql"




/**
 * ...
 *
 * @function updatePassword
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function updatePassword (sqlDatabase, firebaseApp) {

    return async (req, res, next) => {

        const now = new Date()

        try {

            await firebaseApp.auth().signInWithEmailAndPassword(
                req.body.email, req.body.password,
            )

            const password_digest = await bcrypt.hash(req.body.password, 10)
            await sqlDatabase.none(
                sql(__dirname, updatePasswordSQL),
                {
                    uid: firebaseApp.auth().currentUser.uid,
                    password_digest,
                    updated_at: now,
                }
            )
            res.status(201).json({ ok: true })
            next()


        } catch (error) {
            res.status(500).json({error: error.message})
            next()
        }

    }

}
