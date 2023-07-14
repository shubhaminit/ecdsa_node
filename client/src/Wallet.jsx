import { useEffect } from "react";
import server from "./server";

import * as secp from "ethereum-cryptography/secp256k1.js";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { toHex } from "ethereum-cryptography/utils.js";
import { ethers } from "ethers";

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey, faucetBalance, nonce, setNonce }) {
  async function onChange(evt) {
    evt.preventDefault();

    const privateKey = evt.target.value;
    setPrivateKey(privateKey);

    if(ethers.isHexString("0x"+privateKey, 32)){
      const publicKey = secp.secp256k1.getPublicKey(privateKey);
      //console.log("publicKey", publicKey);

      const ethereumAddress = keccak256(publicKey.slice(1)).slice(-20);
      address = toHex(ethereumAddress);

      setAddress(address);

      //replaced with useEffect below
      // if (address) {
      //   const {
      //     data: { balance },
      //   } = await server.get(`balance/${address}`);
      //   setBalance(balance);
      // } else {
      //   setBalance(0);
      // }
    }
    else{
      setAddress("");
    }
  }

  //Feched balance from server
  useEffect(() => {
    async function refreshBalance(){
      if(address){
        const {
          data: { balance },
        } = await server.get(`balance/${address}`);
        setBalance(balance);
      }
      else{
        setBalance(0);
      }
    }
    refreshBalance();
  }, [faucetBalance, address]);

  //Feched nonce from server
  useEffect(() => {
    async function refreshNonce(){
      if(address){
        const {
          data: { nonce },
        } = await server.get(`nonce/${address}`);
        setNonce(nonce);
      }
      else{
        setNonce("N/A");
      }
    }
    refreshNonce();
  }, [address, balance]);
  
  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input placeholder="Type in a private key" value={privateKey} onChange={onChange}></input>
      </label>

      <label>
        Address: 0x{address.slice(0,4)}...{address.slice(-4)}
      </label>

      <label>
        Next nonce: {nonce}
      </label>

      <div className="balance">Balance: {balance} Ξ</div>
    </div>
  );
}

export default Wallet;