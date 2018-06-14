const express = require('express')
const app = express()
const util = require('util')
const bodyParser = require('body-parser')
const serverConfig = require('../config/server.js')
const logger = require('./logger.js')

app.use(bodyParser.json())

// log requests
app.use(function (req, res, next) {
    logger.info('%s %s body=%s', req.method, req.path, JSON.stringify(req.body))
    next()
})

// endpoints
app.get('/', (req, res) => res.json({ msg: 'Hello World!' }))

// start server
let server = app.listen(serverConfig.port, () => console.log(util.format('Example app listening on port %d', serverConfig.port)))

// error handler
app.use(function(error, req, res, next) {
    logger.error('error: "%s" for request: %s %s with body: %s', error.message, req.method, req.path, JSON.stringify(req.body))
    res.status(500).json({
        code: 500,
        message: error.message
    })

})

app.stopServer = function stopServer() {
  server.close()
}

module.exports = app