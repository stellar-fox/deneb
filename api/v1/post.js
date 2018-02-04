const helpers = require('../helpers.js')
const bcrypt = require('bcrypt')
const saltRounds = 10


// ...
function createUser(req, res, next) {
  bcrypt.hash(req.params.password, saltRounds, (err, hash) => {
    let now = new Date()
    helpers.db.one('insert into users(email, password_digest, created_at, updated_at) values(${email}, ${password_digest}, ${created_at}, ${updated_at}) RETURNING id', {
      email: req.params.email,
      password_digest: hash,
      created_at: now,
      updated_at: now,
    })
    .then((result) => {
      res.status(200).json({
        status: 'success',
        id: result.id,
      })
    })
    .catch((error) => {
      res.status(500).json({
        status: 'failure',
        id: error.message,
      })
    })
  })
}


// ...
function authenticate(req, res, next) {
  helpers.db.one('select * from users where email = ${email}', {email: req.params.email})
    .then((dbData) => {
      bcrypt.compare(req.params.password, dbData.password_digest, (err, auth) => {
        res.status(auth ? 200 : 401).json({
          authenticated: auth,
          user_id: dbData.id,
        })
      })
    }).catch((error) => {
      res.status(500).json({
        error: error.message
      })
    })
}


//...
module.exports = {
  createUser: createUser,
  authenticate: authenticate,
}
