/**
 * Deneb.
 *
 * REST API (v2) - Users.
 *
 * @module api-v2-actions-users
 * @license Apache-2.0
 */




import axios from "axios"
import bcrypt from "bcrypt"
import md5 from "blueimp-md5"
import {
    mailchimp as mailchimpConfig,
} from "../../../config/configuration.json"




/**
 * ...
 *
 * @param {Object} sqlDatabase
 * @param {Object} firebaseAdmin
 * @param {Object} firebaseApp
 */
export default function usersActions (
    sqlDatabase,
    firebaseAdmin,
    firebaseApp
) {

    // ...
    const create = async (req, res, _next) => {

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
                "SELECT uid FROM users WHERE uid = ${uid}", {
                    uid: firebaseApp.auth().currentUser.uid,
                }
            )

            if (!userAlreadyExists) {
                const password_digest = await bcrypt.hash(req.body.password, 10)
                const userCreateResp = await sqlDatabase.one(
                    "INSERT INTO users(email, uid, password_digest, created_at, \
                    updated_at) VALUES(${email}, ${uid}, ${password_digest}, \
                    ${created_at}, ${updated_at}) RETURNING id",
                    {
                        email: req.body.email,
                        uid: firebaseApp.auth().currentUser.uid,
                        password_digest,
                        created_at: now,
                        updated_at: now,
                    }
                )

                return res.status(201).json({ userid: userCreateResp.id })
            }
            return res.status(204).send()
        } catch (error) {
            return res.status(401).send()
        }
    }




    // ...
    const subscribeEmail = async (req, res, _next) => {
        let subscription

        try {
            const client = axios.create({
                auth: {
                    username: mailchimpConfig.username,
                    password: mailchimpConfig.apiKey,
                },
                headers: {
                    "Content-Type": "application/json",
                },
            })

            try {
                subscription = (await client.get(
                    `${mailchimpConfig.api}lists/${
                        mailchimpConfig.lists.newSignups}/members/${
                        md5(req.body.email.toLowerCase())}`
                )).data
            } catch (_error) {
                /**
                 * User not found on the list. Proceed.
                 */
            }


            /**
             * User was not found on the subscription list. Add to list.
             */
            if (!subscription) {
                await client.post(`${mailchimpConfig.api}lists/${
                    mailchimpConfig.lists.newSignups}/members/`, {
                    email_address: req.body.email,
                    status: "subscribed",
                })
            }
            /**
             * User was found but status was not "subscribed". Subscribe.
             */
            else if (subscription.status !== "subscribed") {
                await client.patch(
                    `${mailchimpConfig.api}lists/${
                        mailchimpConfig.lists.newSignups}/members/${
                        md5(req.body.email.toLowerCase())}`,
                    {
                        status: "subscribed",
                    }
                )
            }

            return res.status(201).send()

        } catch (error) {
            return res.status(error.response.data.status).json({
                error: error.response.data.title,
            })
        }
    }




    // ...
    const unsubscribeEmail = async (req, res, _next) => {
        try {
            const client = axios.create({
                auth: {
                    username: mailchimpConfig.username,
                    password: mailchimpConfig.apiKey,
                },
                headers: {
                    "Content-Type": "application/json",
                },
            })

            await client.delete(`${mailchimpConfig.api}lists/${
                mailchimpConfig.lists.newSignups}/members/${
                md5(req.body.email.toLowerCase())}`)

            return res.status(204).send()

        } catch (error) {
            return res.status(error.response.data.status).json({
                error: error.response.data.title,
            })
        }
    }




    return {
        create,
        subscribeEmail,
        unsubscribeEmail,
    }

}
