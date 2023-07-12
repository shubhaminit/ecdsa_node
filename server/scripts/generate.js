const { secp256k1 } = require("ethereum-cryptography/secp256k1.js");
const { toHex } = require("ethereum-cryptography/utils.js");
const { keccak256 } = require("ethereum-cryptography/keccak.js");

const privateKey = secp256k1.utils.randomPrivateKey();
console.log('prk:',toHex(privateKey))
const publicKey = secp256k1.getPublicKey(privateKey)
console.log('pbk:',toHex(publicKey))
const address = keccak256(publicKey.slice(1)).slice(-20)
console.log('address',toHex(address))

// prk: 3a33445bf806662b800fd5e1b20c52f6843360563f82a21fdc37bf2b5058155e
// pbk: 02bdc8c7430ae94694c2f4429612817bd6fff90e1b85d4c66f974f44b71348218c
// address f4951811bac0032e7a16ea9ad611a97a947d73aa

// prk: 572cf59bbe66ea5677bb6def83d38409858ee7e0781ead7662f26a63e48e09d7
// pbk: 035b6629f647039b0660bedc4c1579af3fc399771b71bd89c3b34ffeacb457f277
// address 056a8a115ce51e6a8b17316acb57efc7a3f4ee61

// prk: 147c136c32a890cd8b7197d7521014b9f852261ccc657e68aeef61056d96ee5b
// pbk: 0303f444f1aa1e715f7e4b9a0044b9834ee209adb714775c3d619f74d5c7386927
// address 0e3d6a45dcfae8c8ac15ea8743bc533a643e91d0