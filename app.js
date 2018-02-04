#!/usr/bin/env node
const dbConfig = require('./config.js')
const GETAPI = require('./api/v1/get.js')
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


app.listen(4001, () => console.log('Deneb::4001'))
