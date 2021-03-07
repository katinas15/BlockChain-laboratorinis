//https://hackernoon.com/learn-blockchains-by-building-one-117428612f46
//https://www.smashingmagazine.com/2020/02/cryptocurrency-blockchain-node-js/
const crypto = require('crypto')
const _ = require('lodash')

const hashDifficulty = 3

class Blockchain {
    constructor(){
        this.chain = []
        this.currentTransaction = []

        //creating a genesis block
        this.newBlock(1, {proof: 100, hash: 'startHash'})
    }

    newBlock = async (previousHash = null, proofOfWork) => {
        const block = {
            index: this.chain.length,
            timestamp: new Date().toISOString(),
            proof: proofOfWork.proof,
            hash: proofOfWork.hash,
            previousHash,
            transactions: this.currentTransaction
        }

        console.log(`Created block ${block.index}`);

        //reset current transaction list
        this.currentTransaction = []

        this.chain.push(block)
        return block
    }

    newTransaction = (sender, recipient, amount) => {
        this.currentTransaction.push({
            sender, recipient, amount
        })

        return this.getLastBlock().index + 1;
    }

    getLastBlock = () => {
        return this.chain[this.chain.length - 1]
    }

    proofOfWork = async (previousHash) => {
        let proof = 0

        let hash = await Blockchain.hash(previousHash + proof)
        let isValid = await this.validProof(hash)
        while(!isValid){
            console.log(hash)
            proof++
            hash = await Blockchain.hash(previousHash + proof)
            isValid = await this.validProof(hash)
        }

        return {proof, hash}
    }

    validProof = async (guessHash) => {
        //checking if the hash with a specific 'proof' number contains
        //x amount of 0s
        return guessHash.toString().slice(0, hashDifficulty) === "0".repeat(hashDifficulty);
    }

    static hash = async (guess) => {
        //ordering so that hashes would follow the same order
        const sha256 = crypto.createHash('sha256')
        sha256.update(guess.toString())
        const guessHash = await sha256.digest('hex').toString()
        return guessHash.toString()
    }

    getChain = () => {
        return this.chain
    }
}

const blockchain = new Blockchain()
const nodeIdentifier = 'node_pirmasis'

exports.newTransaction = (req, res) => {
    const {sender, recipient, amount} = req.body
    if(!sender) return res.status(400).json('sender not provided')
    if(!recipient) return res.status(400).json('recipient not provided')
    if(!amount) return res.status(400).json('amount not provided')

    const index = blockchain.newTransaction(sender, recipient, amount)
    res.status(200).json(`Transaction will be added to block ${index}`)
}

exports.mining = async (req, res) => {
    //calculating the proof of work
    const lastBlock = blockchain.getLastBlock()
    const previousHash = lastBlock.hash
    let proofOfWork = await blockchain.proofOfWork(previousHash)
    console.log(proofOfWork)


    //sender '0' means that a new coin was mined
    blockchain.newTransaction(
        0,
        nodeIdentifier,
        1)

    const block = await blockchain.newBlock(previousHash, proofOfWork)

    const response = {
        message: 'New block created',
        index: block.index,
        proof: proofOfWork.proof,
        hash: proofOfWork.hash,
        previousHash: previousHash,
        transactions: block.transactions
    }
    return res.status(200).json(response)
}

exports.getChain = (req, res) => {
    res.status(200).json(blockchain.getChain())
}
