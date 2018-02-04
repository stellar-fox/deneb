#!/usr/bin/env node
const dbConfig = require('./config.js')
const GETAPI = require('./api/v1/get.js')
const express = require('express')
const app = express()


/*
 *********************
 ***** GET CALLS *****
 *********************
*/
app.get('/api/v1', (req, res) => res.send('Deneb - REST API. v.1'))
app.get('/api/v1/ticker/latest/:currency', GETAPI.latestCurrency)


app.listen(4001, () => console.log('Deneb::4001'))
