#!/usr/bin/env node
const GETAPI = require('./api/v1/get.js')
const POSTAPI = require('./api/v1/post.js')
const express = require('express')
const app = express()

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/*
 *********************
 ***** GET CALLS *****
 *********************
*/
app.get('/api/v1', (req, res) => res.send('Deneb - REST API. v.1'))
app.get('/api/v1/ticker/latest/:currency', GETAPI.latestCurrency)
app.get('/api/v1/user/:id', GETAPI.user)
app.get('/api/v1/account/:user_id', GETAPI.account)
app.get("/api/v1/user/md5/:pubkey", GETAPI.emailMD5)
/*
 **********************
 ***** POST CALLS *****
 **********************
*/
app.post('/api/v1/user/create/:email/:password', POSTAPI.createUser)
app.post('/api/v1/user/update/:id', POSTAPI.updateUser)
app.post('/api/v1/user/authenticate/:email/:password', POSTAPI.authenticate)
app.post('/api/v1/account/create/:user_id/:pubkey', POSTAPI.createAccount)
app.post('/api/v1/account/update/:user_id', POSTAPI.updateAccount)
app.post("/api/v1/user/ledgerauth/:pubkey/:path", POSTAPI.issueToken)

app.listen(4001, () => console.log('Deneb::4001'))
