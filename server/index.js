const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const ethers = require("ethers");
const { secp256k1 } = require("ethereum-cryptography/secp256k1.js");

app.use(cors());
app.use(express.json());

const balances = {
  // "02bdc8c7430ae94694c2f4429612817bd6fff90e1b85d4c66f974f44b71348218c": 100,  // Sam
  // "035b6629f647039b0660bedc4c1579af3fc399771b71bd89c3b34ffeacb457f277": 50,   // Bane
  // "0303f444f1aa1e715f7e4b9a0044b9834ee209adb714775c3d619f74d5c7386927": 75,   // Shane
};

let nonces = {};

let faucetBalance = 1000;

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.get("/nonce/:address", (req, res) => {
  const { address } = req.params;
  const nonce = nonces[address] || 0;
  res.send({ nonce });
});

app.get("/faucetBalance", (req, res) => {
  res.send({ faucetBalance });
});

app.post("/receiveFromFaucet", (req, res) => {
  const { amount, recipient } = req.body;
  const requestedAmount = parseInt(amount);

  if(ethers.isAddress(recipient)){
    //Debug (see server logs)
    console.log("\nNew request from Server Faucet!");
    console.log("recipient:", recipient);
    console.log("faucet balance:", faucetBalance);
    console.log("requested amount:", requestedAmount);

    setInitialBalance(recipient);

    if (requestedAmount > faucetBalance) {
        res.status(400).send({ message: "Not enough funds in faucet!" });
        console.log("Not enough funds in faucet!");
    } else {
        faucetBalance -= requestedAmount;
        balances[recipient] += requestedAmount;
        res.send({ newFaucetBalance: faucetBalance });
        console.log("new faucet balance:", faucetBalance);
    }
  } else {
    res.status(400).send({ message: "Invalid address!" });
  }
});

app.post("/transfer", (req, res) => {
  // TODO: get a signature from the client-side application
  // recover the public address from the signature --> becomes sender

  const { from, to, amount, signatureString, hexPublicKey } = req.body;

  //Debug (see server logs)
  console.log("\nNew transfer request from client!");
  console.log("sender:", from);
  console.log("recipient:", to);
  console.log("amount:", amount);

  if(ethers.isAddress(from) && ethers.isAddress(to) && amount > 0 && signatureString && hexPublicKey){
    let sender = from;
    let recipient = to;

    //Remove 0x prefix if present
    if(sender.slice(0,2) === "0x"){
      sender = sender.slice(2);
    }
    if(recipient.slice(0,2) === "0x"){
      recipient = recipient.slice(2);
    }

    //Initialize balances if needed
    setInitialBalance(sender);
    setInitialBalance(recipient);

    //Initialize nonce if needed
    setInitialNonce(sender);

    //Check if sender has enough funds
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      console.log("nonce:", nonces[sender]);
      // Recover the hash of the encoded transaction
      const coder = ethers.AbiCoder.defaultAbiCoder();
      const encodedTx = coder.encode(
        ["address", "address", "uint256", "uint256"],
        [sender, recipient, amount, nonces[from]],
      );
      const hashedEncodedTx = ethers.keccak256(encodedTx);

      // Recover the signature
      const signature = JSON.parse(signatureString);
      signature.r = BigInt(signature.r);
      signature.s = BigInt(signature.s);

      // Verify the signature
      const isSigned = secp256k1.verify(signature, hashedEncodedTx.slice(2), hexPublicKey);

      // Deny the transfer if the signature is invalid
      if(!isSigned){
        res.status(400).send({ message: "Invalid signature!" });
        return;
      }

      // Transfer the funds (keep track of transfers internally)
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });

      // Increment the nonce for the sender
      nonces[sender] += 1;
    }
  } else {
    res.status(400).send({ message: "Invalid transfer request!" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function setInitialNonce(address) {
  if (!nonces[address]) {
    nonces[address] = 0;
  }
}
