require('module-alias/register')
const express = require('express')
const app = express()
app.use(express.json())

const args = process.argv.slice(2)
const port = args[2]


app.set('port', port)
app.use(require('@routes'))
app.listen(app.get('port'))


console.log('****************************')
console.log('*    Starting Server')
console.log(`*    Port: ${port}`)

module.exports = app