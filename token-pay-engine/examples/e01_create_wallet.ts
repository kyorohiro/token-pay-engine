//
// Example: Create and restore an Ethereum wallet
// npx tsx examples/wallet_create.ts
//
import {  ethers, randomBytes, keccak256, toUtf8Bytes } from "ethers";

// ランダムなウォレットを作成
const wallet = ethers.Wallet.createRandom();

// 後で使う
const privateKey = wallet.privateKey;
const address = wallet.address;

console.log("New Wallet Created");
console.log("Address:", address);
console.log("Private Key:", privateKey);
console.log("Mnemonic:", wallet.mnemonic?.phrase);
console.log(wallet);
console.log("--------------------------------------------------");

// 既存の秘密鍵からウォレットを復元
const restoredWallet = new ethers.Wallet(privateKey);

console.log("Restored Wallet");
console.log("Address:", restoredWallet.address);
console.log("Private Key:", restoredWallet.privateKey);
//console.log("Mnemonic:", restoredWallet.mnemonic ? restoredWallet.mnemonic.phrase : "N/A");
console.log(restoredWallet);
console.log("--------------------------------------------------");

// ウォレットアドレスの検証
if (restoredWallet.address === address) {
    console.log("The restored wallet address matches the original address.");
} else {
    console.log("The restored wallet address does NOT match the original address.");
}

// npx tsx examples/wallet_create.ts
// npx tsx examples/wallet_create.ts


/*
New Wallet Created
Address: 0x94896D843713d7Ee3104539d37a0617D24E43B29
Private Key: 0x688de1041707b997912d032467e43c63adab2203544c36e25c4dda2de79603c5
Mnemonic: sick stadium volume hair click wool unique notice dove trial easy office
HDNodeWallet {
  provider: null,
  address: '0x94896D843713d7Ee3104539d37a0617D24E43B29',
  publicKey: '0x032140a93d3d13fb379fd894ecf0ad228f5d04b9deff8cb35b81e6db291f4c1a3c',
  fingerprint: '0x9df9cf99',
  parentFingerprint: '0x694ab3c1',
  mnemonic: Mnemonic {
    phrase: 'sick stadium volume hair click wool unique notice dove trial easy office',
    password: '',
    wordlist: LangEn { locale: 'en' },
    entropy: '0xc7da7fd73422abfabb64b741dd05174c'
  },
  chainCode: '0xe966f74da6ff8f4646e286bb3b9893d9982de80672a70b05e5914ded84756476',
  path: "m/44'/60'/0'/0/0",
  index: 0,
  depth: 5
}
--------------------------------------------------
Restored Wallet
Address: 0x94896D843713d7Ee3104539d37a0617D24E43B29
Private Key: 0x688de1041707b997912d032467e43c63adab2203544c36e25c4dda2de79603c5
Wallet {
  provider: null,
  address: '0x94896D843713d7Ee3104539d37a0617D24E43B29'
}
--------------------------------------------------
The restored wallet address matches the original address.
*/