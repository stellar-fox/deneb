const
    bcrypt = require("bcrypt"),
    helpers = require("../../helpers")




// ...
const create = async (req, res, _next) => {

    const now = new Date()
    try {
        const uid = (await helpers.firebaseAdmin.auth()
            .verifyIdToken(req.body.token)).uid

        await helpers.firebaseApp.auth().signInWithEmailAndPassword(
            req.body.email, req.body.password,
        )

        if (uid !== helpers.firebaseApp.auth().currentUser.uid) {
            return res.status(403).json({ error: "Forbidden.", })
        }

        const userAlreadyExists = await helpers.db.oneOrNone(
            "SELECT uid FROM users WHERE uid = ${uid}", {
                uid: helpers.firebaseApp.auth().currentUser.uid,
            }
        )

        if (!userAlreadyExists) {
            const password_digest = await bcrypt.hash(req.body.password, 10)
            const userCreateResp = await helpers.db.one(
                "INSERT INTO users(email, uid, password_digest, created_at, \
                updated_at) VALUES(${email}, ${uid}, ${password_digest}, \
                ${created_at}, ${updated_at}) RETURNING id",
                {
                    email: req.body.email,
                    uid: helpers.firebaseApp.auth().currentUser.uid,
                    password_digest,
                    created_at: now,
                    updated_at: now,
                }
            )

            return res.status(201).json({ userid: userCreateResp.id, })
        }
        return res.status(204).send()
    } catch (error) {
        return res.status(401).send()
    }
}




// ...
const subscribeEmail = async (req, res, _next) => {
    try {
        const client = helpers.axios.create({
            auth: {
                username: helpers.config.mailchimp.username,
                password: helpers.config.mailchimp.apiKey,
            },
            headers: {
                "Content-Type": "application/json",
            },
        })

        await client.post(`${helpers.config.mailchimp.api}lists/${
            helpers.config.mailchimp.lists.newSignups}/members/`, {
            email_address: req.body.email,
            status: "subscribed",
        })

        return res.status(201).send()

    } catch (error) {
        return res.status(error.response.data.status).json({
            error: error.response.data.title,
        })
    }
}




// ...
module.exports = {
    create,
    subscribeEmail,
}
