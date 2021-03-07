require('module-alias/register')
const express = require('express')
const app = express()

app.use(express.json())

app.set('port', 3000)
app.use(require('@routes'))
app.listen(app.get('port'))


console.log('****************************')
console.log('*    Starting Server')
console.log(`*    Port: ${3000}`)

module.exports = app