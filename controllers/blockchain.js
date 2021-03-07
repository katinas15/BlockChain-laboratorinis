//https://hackernoon.com/learn-blockchains-by-building-one-117428612f46
const crypto = require('crypto')
const _ = require('lodash')

const hashDifficulty = 4

class Blockchain {
    constructor(){
        this.chain = []
        this.currentTransaction = []

        //creating a genesis block
        this.newBlock(1, 100)
    }

    newBlock = (previousHash = null, proof) => {
        const block = {
            index: this.chain.length,
            timestamp: new Date().toISOString(),
            transactions: this.currentTransaction,
            proof,
            previousHash
        }

        //reset current transaction list
        this.currentTransaction = []

        this.chain.push(block)
        return block
    }

    newTransaction = (sender, recipient, amount) => {
        this.currentTransaction.push({
            sender, recipient, amount
        })

        return this.lastBlock.length - 1;
    }

    lastBlock = () => {
        return this.chain[this.chain.length - 1]
    }

    proofOfWork = async (lastProof) => {
        let proof = 0
        while(await !this.validProof(lastProof, proof)){
            proof += 1
        }

        return proof
    }

    validProof = async (lastProof, proof) => {
        //checking if the hash with a specific 'proof' number contains
        //x amount of 0s

        const guess = lastProof + proof
        const guessHash = await crypto.subtle.digest('SHA-256', guess)
        
        //counting 0s
        let numberOfZeros = 0
        for(let i = guessHash.length - 1; i >= 0; i--){
            const currentChar = guessHash[i]
            if(currentChar === '0') {
                numberOfZeros++
                if(numberOfZeros >= hashDifficulty) return true
            } else {
                return false
            }
        }

        return false
    }

    hash = async (block) => {
        const sortedBlock = _.orderBy(block.transactions, ['sender'], ['desc'])
        return await crypto.subtle.digest('SHA-256', sortedBlock)
    }
}

const blockchain = new Blockchain()

exports.newTransaction = async (req, res) => {

    const {sender, recipient, amount} = req.body
    if(!sender) return res.status(400).json('sender not provided')
    if(!recipient) return res.status(400).json('recipient not provided')
    if(!amount) return res.status(400).json('amount not provided')

    res.status(200).json('transaction completed')
}