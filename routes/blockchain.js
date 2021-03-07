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

router.post(
    '/nodes/register',
    controller.registerNode)

router.get(
    '/nodes/resolve',
    controller.resolveBlockchain)

module.exports = router