const { secp256k1 } = require("ethereum-cryptography/secp256k1.js");
const { toHex } = require("ethereum-cryptography/utils.js");
const { keccak256 } = require("ethereum-cryptography/keccak.js");

const privateKey = secp256k1.utils.randomPrivateKey();
console.log('prk:',toHex(privateKey))
const publicKey = secp256k1.getPublicKey(privateKey)
console.log('pbk:',toHex(publicKey))
const address = keccak256(publicKey.slice(1)).slice(-20)
console.log("ethereum address: 0x" + toHex(address));
