/**
 * Deneb.
 *
 * 'Unsubscribe email' action.
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
 * Remove user's email from the distribution list.
 *
 * @function unsubscribeEmail
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function unsubscribeEmail () {

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

        try {

            // Delete email from the subscription list
            await client.delete(`${mailchimpConfig.api}lists/${
                mailchimpConfig.lists.newSignups}/members/${
                md5(req.body.email.toLowerCase())}`)

            res.status(204).json({
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
