const express = require('express')
const router = express.Router()
const controller = require('@controllers/blockchain')

router.post(
    '/transactions/new',
    controller.newTransaction)

router.get(
    '/mine',
    controller.mining)

router.get(
    '/chain',
    controller.getChain)

module.exports = router