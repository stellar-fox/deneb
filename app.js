const express = require('express')
const app = express()

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(4001, () => console.log('App listenin on 4001.'))
