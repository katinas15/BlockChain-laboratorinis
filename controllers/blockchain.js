//https://hackernoon.com/learn-blockchains-by-building-one-117428612f46
//https://www.smashingmagazine.com/2020/02/cryptocurrency-blockchain-node-js/
const crypto = require('crypto')
const _ = require('lodash')
const axios = require('axios')
const {getIP} = require('@middleware/utils')

const hashDifficulty = 3

class Blockchain {
    constructor(){
        this.chain = []
        this.currentTransaction = []

        //creating a genesis block
        this.newBlock(1, {proof: 100, hash: 'startHash'})

        this.peers = new Set()
    }

    addPeer = (address) => {
        this.peers.add(address)
    }

    getPeers = () => {
        return Array.from(this.peers)
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
        let isValid = await Blockchain.validProof(hash)
        while(!isValid){
            console.log(hash)
            proof++
            hash = await Blockchain.hash(previousHash + proof)
            isValid = await Blockchain.validProof(hash)
        }

        return {proof, hash}
    }

    static validProof = async (guessHash) => {
        //checking if the hash with a specific 'proof' number contains
        //x amount of 0s
        return guessHash.toString().slice(0, hashDifficulty) === "0".repeat(hashDifficulty);
    }

    static hash = async (guess) => {
        const sha256 = crypto.createHash('sha256')
        sha256.update(guess.toString())
        const guessHash = await sha256.digest('hex').toString()
        return guessHash.toString()
    }

    getChain = () => {
        return this.chain
    }

    static validChain = async (chain) => {
        let previousBlock = chain[0]
        let currentIndex = 1

        while (currentIndex < chain.length){
            let block = chain[currentIndex]

            if(block.previousHash != previousBlock.hash)
                return false
            
            const isProofValid = await Blockchain.validProof(await Blockchain.hash(block.previousHash + block.proof))
            if(!isProofValid){
                // console.log('is not valid')
                return false
            } else {
                previousBlock = block
                currentIndex++
            }
        }

        if(currentIndex == chain.length){
            // console.log('is valid')
            return true
        }
            
    }

    resolveConflicts = async () => {
        return new Promise(resolve => {
            const peers = this.getPeers()
            let newChain = null
            let maxLength = this.chain.length
    
            for(let i in peers){
                const peer = peers[i]
                axios.get(`${peer}/blockchain/chain`).then(async (res) => {
                    if(res.status === 200){
                        const chain = res.data
                        const length = chain.length
    
                        console.log(await Blockchain.validChain(chain))
                        if(maxLength < length && await Blockchain.validChain(chain)){
                            maxLength = length
                            newChain = chain
    
                            if(i == peers.length - 1){
                                console.log('last')
                                if(newChain){
                                    console.log('new chain')
                                    this.chain = newChain
                                    resolve(true)
                                } else resolve(false)
                            }
                        }
                    }
                }).catch(e => {
                    console.log(e.message)
                })
            }
        })

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

exports.registerNode = (req, res) => {
    const {peers} = req.body
    if(!peers) return res.status(400).json('please supply a valid list of peers')
    const address = getIP(req)

    blockchain.addPeer(address)
    for(let i in peers){
        const peer = peers[i]
        blockchain.addPeer(peer)
    }
    
    res.status(200).json(blockchain.getPeers())
}

exports.resolveBlockchain = async (req, res) => {
    blockchain.resolveConflicts().then((resolved) => {
        console.log(resolved)
        if(resolved){
            return res.status(200).json('chain replaced')
        } else {
            return res.status(200).json('our chain is the longest')
        }
    })
}
