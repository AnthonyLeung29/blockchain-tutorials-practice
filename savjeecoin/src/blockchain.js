const SHA256 = require('crypto-js/sha256');

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');


class Identity {
  constructor (birthday, sin) {
    this.birthday = birthday
    this.sin = sin;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(this.birthday + this.sin).toString();
  }
}

const identity = {
  driverslicenseHASH: '304402201d6971c5e5865c9d0d2c3e63ff3e3309d76fe923578c3df7',
  birthday: '304402201d6971c5e5865c9d0d2c3e63ff3e3309d76fe923578c3df8'
}

// How am i gonna know that is YOURS? 
// How am i gonna know the data?

// What if we don't JUST use blockchains?
// What if we use blockchains just to verify, or allow access, to a certain document??

// Government already has all our data
// Anthony's driver's liscence: 1093-28103-4821
// Stored somewhere SECRET WOWOZA
// Trust, no one can access this

// Winnie. She is nosie company and wwants to know my drivers liscense?
// Only way she can get it, is by gettting from Anthony, or the government.

// Anthony can straight up give it to her, but what if I'm unavailable?
// Winnie can ask government. But government will be like, WHO DAFUQ R U WHY U NEED HIS INFO?
// DID HE CONSENT? THIS IS 2019 MOFO?

// Government has access to blockchain, yes they can see a transaction saying I allow winnie to see it
// How will the government know that anthony_public key, is anthony?

// Possibilities: Government keeps a list of all public keys and person it links too??

// Send transaction to anthony to verify again??
// transaction(government_publickey, anthonys_publickey, winnie's public_key, DL = 4)
// I'll open my mailbox with my private key, and i'll see that the government wants to
// give out? my information related to drivers licnese to winnie

// I would already have your public key, because I sent you permission already. So I KNOW this is
// valid. That the government SHOULD let you see my info.
// Now how do i let the government know??????

// transaction(anthonys_PK, governmentPK, winniePK, driver = 4)

/*
Anthony wants to register a car
  - Government needs to verify I have a damn liscense
  - NORMALLY: I gotta photocopy my ass over and send info - PAIN IN THE BUTT
  - transaction(government_publicId, anthony_id, birthday=6, citizenship=7)

GOVERNMENT WANTS TO VERIFY DRIVERS LISENCE
  - Birthday, Citizenship
  - Anthony wants to register a car. We needa verify this guy
  - NORMALLY: Whoever works there has to receive in the mail a photocopy, look into the database
    verify that info is me. Then allow permission for car. - DELAY I GOTTA RECEIVE MAIL
  - OR: receive a transaction that gives me permission to look at it.
      transaction(government_publicId, anthony_id, birthday=6, citizenship=7)
        - THIS IS GOVERNMENT ASKING to see said info
      transaction(anthony_id, government_publicId, birthday=6, citizenship=7)
        - This is anthony giving permissio nto see said info

*/

/*
AIR BNB
  - transaction(airbnb_id, winnie_id, passportid=8)

  - transaction(airbnb_id, government_id, winnie_id, passPOrtid=8)
GOVERNMENT
  - transaction(government_id, winnie_id, airbnb_id, passPOrtid=8)


WINNIE
  - transaction(winnie_id, airbnb_id, passportid=8)

  - transaction(winnie_id, government_id, airbnb_id, passPOrtid=8)
*

/*
Korea GOVERNMENT
  - transaction(korea_id, government_id, winnie_id, passPortid=8, passports citizenship_id)
Canadaian GOVERNMENT
  - transaction(government_id, winnie_id, airbnb_id, passPOrtid=8)
  
  - transaction(government_id, korea_id, airbnb_id, YES)
WINNIE
  - transaction(winnie_id, government_id, airbnb_id, passPOrtid=8)
*/

class Transaction {
  constructor (anthonys_publickey, winnie_publickey, AMiOVER18 = 7) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
  }

  calculateHash() {
    return SHA256(this.fromAddress + this.toAddress + this.amount + this.timestamp).toString();
  }

  signTransaction(signingKey) {
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets!');
    }

    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex');
  }

  isValid() {
    if (this.fromAddress === null) return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return SHA256(
      this.previousHash + 
      this.timestamp + 
      this.nonce + 
      JSON.stringify(this.transactions)
    ).toString();
  }

  // A block has 1 mb worth of data. 1 mbs of transactions
  // 0000000bgkjhfawhoefijawoeifjaw
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log(`Block mined: ${this.hash}`);
  }

  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }
    return true;
  }
}

class Blockchain {
  constructor () {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
    return new Block(Date.parse("2017-01-01"), [], "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // In reality, miners have to pick transactions. Cannot exceed 1 mb
  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(rewardTx);

    let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    this.chain.push(block);

    this.pendingTransactions = [];
  }

  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }

    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    this.pendingTransactions.push(transaction);
  }

  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) 
        return false;

      if (currentBlock.previousHash !== previousBlock.calculateHash())
        return false;
    }
    return true;
  }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;