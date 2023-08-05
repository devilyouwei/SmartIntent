const ROOT = require('app-root-path')
const express = require('express')
const serveIndex = require('serve-index')
const multer = require('multer')
const app = express()
const CTRL = require('app-root-path') + '/web/'
const bodyParser = require('body-parser')

// cross domain
const allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET,POST')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header('Access-Control-Allow-Credentials', 'true')
    if (req.method.toLowerCase() == 'options') res.send(200)
    else next()
}

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(allowCrossDomain)
app.use(multer().array())

app.get('/', (_, res) => {
    res.send(`
        <h1>SmartIntentNN API</h1>
        <a href="https://github.com/devilyouwei/SmartIntent">See Documentation</a>`)
})

const statics = ['evaluates', 'models']
app.use('/evaluates', express.static(`${ROOT}/tf/evaluates`))
app.use('/evaluates', serveIndex(`${ROOT}/tf/evaluates`, { icons: true }))
app.use('/models', express.static(`${ROOT}/tf/models`))
app.use('/models', serveIndex(`${ROOT}/tf/models`, { icons: true }))

app.all('*', (req, res, next) => {
    try {
        const path = req.path.toString()
        const ctl = path.split('/')[1]
        if (statics.includes(ctl)) return next()
        if (req.method == 'GET') req.body = req.query // get强制转post参数

        // MVC
        const act = path.split('/')[2]
        const fun = require(CTRL + ctl)
        fun[act](req, res, next)
    } catch (e) {
        console.error(e)
        next(e)
    }
})

app.listen(8080)
console.log('Server Started')
