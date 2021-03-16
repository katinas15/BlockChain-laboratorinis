
 
## Startup
Start two or more local instances by running this command in the terminal:

`node index.js <port>`

Example:

`node index.js 3000`

## Usage
For interacting with nodes in the blockchain you to need to make HTTP requests (using Postman is recommended).

All example uses below.

**Creating a transaction:**

Transaction is created by specifying hashes of 'sender' and 'recipient', and the 'amount' sent 

```
POST http://localhost:3000/blockchain/transactions/new

BODY
{
    "sender": "281b23bn",
    "recipient": "abaa2",
    "amount": 12
}
```



**Start mining:**

This will start mining for a hash that starts with **3** zeros and create a new block when the hash is found

```
GET http://localhost:3000/blockchain/mine
```



**Get Chain:**

Will return the full chain in that node

```
GET http://localhost:3000/blockchain/chain
```



**Register nearby nodes:**

To reach a consensus of the longest chain you need to register other nodes

_Note_: specify the adresses of local nodes, in this case by changing to the correct port

```
POST http://localhost:3001/blockchain/nodes/register

BODY
{
    "peers": ["http://127.0.0.1:3000"]
}
```



**Resolve chain:**

After receiving this request node will make a request to all other registered nodes and check if it has the longest chain. If the chain is shorter, it will be replaced by the longest chain

```
GET http://localhost:3001/blockchain/nodes/resolve
```



# Sources
https://hackernoon.com/learn-blockchains-by-building-one-117428612f46

https://www.smashingmagazine.com/2020/02/cryptocurrency-blockchain-node-js/
