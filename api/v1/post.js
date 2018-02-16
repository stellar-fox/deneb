const helpers = require("../helpers.js")
const bcrypt = require("bcrypt")
const saltRounds = 10


// ...
function createUser (req, res, _) {
    bcrypt.hash(req.params.password, saltRounds, (_, hash) => {
        let now = new Date()
        helpers.db.one(
            "insert into users(email, password_digest, created_at, updated_at)\
            values(${email}, ${password_digest}, ${created_at}, ${updated_at})\
            RETURNING id", {
                email: req.params.email,
                password_digest: hash,
                created_at: now,
                updated_at: now,
            })
            .then((result) => {
                res.status(201).json({
                    status: "success",
                    id: result.id,
                })
            }).catch((error) => {
                const retCode = helpers.errorMessageToRetCode(error.message)
                res.status(retCode).json({
                    status: "failure",
                    id: error.message,
                    code: retCode,
                })
            })
    })
}


// ...
function createAccount (req, res, _) {
    let now = new Date()
    helpers.db.one(
        "insert into accounts\
        (pubkey, alias, user_id, visible, created_at, updated_at)\
        values (${pubkey}, ${alias}, ${user_id}, ${visible}, ${created_at},\
        ${updated_at}) RETURNING id", {
            pubkey: req.params.pubkey,
            alias: (_) => {
                return (req.query.alias !== undefined ? req.query.alias : null)
            },
            user_id: req.params.user_id,
            visible: (_) => {
                return (req.query.visible == "false" ? false : true)
            },
            created_at: now,
            updated_at: now,
        })
        .then((result) => {
            res.status(201).json({
                success: true,
                account_id: result.id,
            })
        })
        .catch((error) => {
            const retCode = helpers.errorMessageToRetCode(error.message)
            res.status(retCode).json({
                status: "failure",
                id: error.message,
                code: retCode,
            })
        })
}


// ...
function updateUser(req, res, next) {
  if(!helpers.tokenIsValid(req.query.token, req.params.id)) {
    return res.status(403).json({
      error: "Forbidden",
    })
  }
  helpers.db.tx(t => {
    return t.batch([
      (req.query.first_name !== undefined ?
        t.none('UPDATE users SET first_name = $1 WHERE id = $2',
          [req.query.first_name, req.params.id]) : null
      ),
      (req.query.last_name !== undefined ?
        t.none('UPDATE users SET last_name = $1 WHERE id = $2',
          [req.query.last_name, req.params.id]) : null
      ),
      t.none('UPDATE users SET updated_at = $1 WHERE id = $2',
        [new Date(), req.params.id]),
    ])
  })
  .then(data => {
    res.status(204).json({
      status: 'success',
    })
  })
  .catch(error => {
    res.status(500).json({
      error: error.message,
    })
  })
}


// ..
function updateAccount(req, res, next) {
  if(!helpers.tokenIsValid(req.query.token, req.params.user_id)) {
    return res.status(403).json({
      error: "Forbidden",
    })
  }
  helpers.db.tx(t => {
    return t.batch([
      (req.query.alias !== undefined ?
        t.none('UPDATE accounts SET alias = $1 WHERE user_id = $2',
          [req.query.alias, req.params.user_id]) : null
      ),
      (req.query.visible !== undefined ?
        t.none('UPDATE accounts SET visible = ${visible} WHERE user_id = ${user_id}',
          {
            visible: visible => {
              return (req.query.visible == 'false' ? false : true)
            },
            user_id: req.params.user_id
          }) : null
      ),
      (req.query.currency !== undefined ?
        t.none('UPDATE accounts SET currency = $1 WHERE user_id = $2',
          [req.query.currency, req.params.user_id]) : null
      ),
      (req.query.precision !== undefined ?
        t.none('UPDATE accounts SET precision = $1 WHERE user_id = $2',
          [req.query.precision, req.params.user_id]) : null
      ),
      t.none('UPDATE accounts SET updated_at = $1', [new Date()]),
    ])
  })
  .then(data => {
    res.status(204).json({
      status: 'success',
    })
  })
  .catch(error => {
    res.status(500).json({
      error: error.message,
    })
  })
}


// ...
function authenticate(req, res, next) {
  helpers.db.any('select * from users where email = ${email}', {email: req.params.email})
    .then((dbData) => {
      // user found
      if (dbData.length === 1) {
        bcrypt.compare(req.params.password, dbData[0].password_digest, (err, auth) => {
          if (auth) {
            helpers.db.one('select pubkey from accounts where user_id = ${user_id}', {
              user_id: dbData[0].id
            })
            .then((dbAccount) => {
              bcrypt.hash(`${helpers.getApiKey()}${dbData[0].id}`, saltRounds, (error, hash) => {
                // authenticated
                res.status(200).json({
                  authenticated: true,
                  user_id: dbData[0].id,
                  pubkey: dbAccount.pubkey,
                  token: new Buffer(hash).toString('base64'),
                })
              })
            })
            .catch((error) => {
              console.log(next(error.message))
            })
          } else {
            // not authenticated
            res.status(401).json({
              authenticated: false,
              user_id: null,
              pubkey: null,
            })
          }
        })
      }
      // user not found in DB
      else {
        res.status(401).json({
          authenticated: false,
          user_id: null,
          pubkey: null,
        })
      }

    }).catch((error) => {
      console.log(error)
      res.status(500).json({
        error: error.message
      })
    })
}


//...
module.exports = {
  updateUser: updateUser,
  authenticate: authenticate,
  createAccount: createAccount,
  updateAccount: updateAccount,
    createUser,
}
