/**
 * Deneb.
 *
 * 'Subscribe email' action.
 *
 * @module users-actions
 * @license Apache-2.0
 */




import axios from "axios"
import md5 from "blueimp-md5"
import {
    mailchimp as mailchimpConfig,
} from "../../../../config/configuration.json"




/**
 * Subscribe user's email to welcome email distribution list.
 *
 * @function subscribeEmail
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function subscribeEmail () {

    return async (req, res, next) => {

        const client = axios.create({
            auth: {
                username: mailchimpConfig.username,
                password: mailchimpConfig.apiKey,
            },
            headers: {
                "Content-Type": "application/json",
            },
        })

        let subscription = null


        try {
            subscription = await client.get(
                `${mailchimpConfig.api}lists/${
                    mailchimpConfig.lists.newSignups}/members/${
                    md5(req.body.email.toLowerCase())}`
            )
        } catch (error) {
            // catch Axios' 404 ...
        }



        try {

            // User was not found on the subscription list. Add to list.
            if (!subscription) {
                await client.post(`${mailchimpConfig.api}lists/${
                    mailchimpConfig.lists.newSignups}/members/`, {
                    email_address: req.body.email,
                    status: "subscribed",
                })
            }

            // User was found but status was not "subscribed". Subscribe.
            else if (subscription.data && subscription.data.status !== "subscribed") {
                await client.patch(
                    `${mailchimpConfig.api}lists/${
                        mailchimpConfig.lists.newSignups}/members/${
                        md5(req.body.email.toLowerCase())}`,
                    {
                        status: "subscribed",
                    }
                )
            }
            res.status(201).json({
                status: "success",
            })
            next()

        } catch (error) {
            res.status(error.response.status).json({
                error: error.response.statusText,
            })
            next()
        }
    }

}
