const { Blockchain, Transaction } = require('./blockchain');

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('cef5f7062449a8072d280e1346dcc968a1e5143c48d4c4718637b11f7d8ebf01');
const myWalletAddress = myKey.getPublic('hex');

let savjeeCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
savjeeCoin.addTransaction(tx1);


console.log('\nStarting the miner...');
savjeeCoin.minePendingTransactions(myWalletAddress);

console.log('\nBalance of xavier is ', savjeeCoin.getBalanceOfAddress(myWalletAddress));

savjeeCoin.chain[1].transactions[0].amount = 1;

console.log('Is chain valid?', savjeeCoin.isChainValid());

console.log(JSON.stringify(savjeeCoin, null, 2));
