/**
 * Deneb.
 *
 * Contacts related actions.
 *
 * @module contacts-actions
 * @license Apache-2.0
 */




import axios from "axios"
import md5 from "blueimp-md5"
import {
    mailchimp as mailchimpConfig,
} from "../../../../config/configuration.json"

import { contactStatusCodes } from "../../../../lib/helpers"
import { sql } from "../../../../lib/utils"

import getContactIdSQL from "./get_contact_id.sql"
import getUserIdSQL from "./get_user_id.sql"
import insertContactSQL from "./insert_contact.sql"
import updateContactStatusSQL from "./update_contact_status.sql"




/**
 * ...
 *
 * @function requestByEmail
 * @param {Object} sqlDatabase Database connection.
 * @returns {Function} express.js action.
 */
export default function requestByEmail (sqlDatabase) {

    return async (req, res, next) => {

        let now = new Date()

        const registeredUser = await sqlDatabase.oneOrNone(
            sql(__dirname, getUserIdSQL),
            { email: req.body.email }
        )

        if (registeredUser) {
            const contact_id = await sqlDatabase.oneOrNone(
                sql(__dirname, getContactIdSQL),
                {
                    contact_id: registeredUser.id,
                    requested_by: req.body.user_id,
                    status: contactStatusCodes.DELETED,
                },
                (e) => e && e.contact_id
            )

            if (contact_id) {
                try {
                    await sqlDatabase.tx((t) => {
                        return t.batch([
                            t.none(
                                sql(__dirname, updateContactStatusSQL),
                                {
                                    contact_id,
                                    requested_by: req.body.user_id,
                                    status: contactStatusCodes.REQUESTED,
                                }
                            ),
                            t.none(
                                sql(__dirname, updateContactStatusSQL),
                                {
                                    contact_id,
                                    requested_by: req.body.user_id,
                                    status: contactStatusCodes.PENDING,
                                }),
                        ])
                    })
                    res.status(204).send()
                    next()
                } catch (error) {
                    return next(error.message)
                }

            } else {
                try {
                    await sqlDatabase.tx((t) => {
                        return t.batch([
                            t.none(
                                sql(__dirname, insertContactSQL),
                                {
                                    contact_id: registeredUser.id,
                                    requested_by: req.body.user_id,
                                    status: contactStatusCodes.REQUESTED,
                                    created_at: now,
                                    updated_at: now,
                                    request_str: "",
                                }
                            ),
                            // reciprocal - along with email of requestee
                            t.none(
                                sql(__dirname, insertContactSQL),
                                {
                                    contact_id: req.body.user_id,
                                    requested_by: registeredUser.id,
                                    status: contactStatusCodes.PENDING,
                                    created_at: now,
                                    updated_at: now,
                                    request_str: req.body.email,
                                }
                            ),
                        ])
                    })
                } catch (_error) {
                    res.status(409).send()
                    next()
                }
            }
        }

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
                const subscriber = await client.get(`${mailchimpConfig.api}lists/${
                    mailchimpConfig.lists.searchByEmail}/members/${
                    md5(req.body.email.toLowerCase())
                }`)

                // email is already on the subscription list
                if (subscriber.data.status === "subscribed") {
                    res.status(409).send()
                    next()
                }

                // TODO: perhaps detect here different subscription states
                // and return proper code along with message.
                res.status(409).send()
                next()

            } catch (_error) {
                // email is not yet on the subscription list
                await client.post(`${mailchimpConfig.api}lists/${
                    mailchimpConfig.lists.searchByEmail}/members/`, {
                    email_address: req.body.email,
                    status: "subscribed",
                    merge_fields: {
                        REFERRER: req.body.referrer.email,
                        REFERRERFN: req.body.referrer.first_name,
                        REFERRERLN: req.body.referrer.last_name,
                    },
                })
                res.status(201).send()
                next()
            }

        } catch (error) {
            res.status(error.response.data.status).json({
                error: error.response.data.title,
            })
            next()
        }

    }

}
