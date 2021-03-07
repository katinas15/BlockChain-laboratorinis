const express = require('express')
const router = express.Router()
const controller = require('@controllers/blockchain')

router.post(
    '/transactions/new',
    controller.newTransaction)

router.get(
    '/mine',
    controller.newTransaction)

router.get(
    '/chain',
    controller.newTransaction)

module.exports = router