/**
 * Deneb.
 *
 * REST API (v2) - Users.
 *
 * @module api-v2-actions-users
 * @license Apache-2.0
 */




import axios from "axios"
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
export default function usersActions () {

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
        subscribeEmail,
        unsubscribeEmail,
    }

}
