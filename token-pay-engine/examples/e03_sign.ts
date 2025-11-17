//
// Example: Sign a message with an Ethereum private key
// ETH_PRIVATE_KEY=0x688de1041707b997912d032467e43c63adab2203544c36e25c4dda2de79603c5 npx tsx examples/sign.ts "hello world"
//
import { Wallet } from "ethers";

function printUsage() {
  console.log(`
Usage:
  ETH_PRIVATE_KEY=0x... node sign.js "<message>"
  node sign.js "<message>" --key 0x...

Examples:
  ETH_PRIVATE_KEY=0xabc... node sign.js "hello world"
  node sign.js "Eth Shop Ownership Proof / orderId=123 / nonce=xxxx" --key 0xabc...
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  // メッセージ
  const message = args[0];

  // 秘密鍵：環境変数 または --key
  let privateKey = process.env.ETH_PRIVATE_KEY || null;

  const keyFlagIndex = args.indexOf("--key");
  if (!privateKey && keyFlagIndex !== -1 && args[keyFlagIndex + 1]) {
    privateKey = args[keyFlagIndex + 1];
  }

  if (!privateKey) {
    console.error("Error: ETH_PRIVATE_KEY env または --key で秘密鍵を指定してください。");
    printUsage();
    process.exit(1);
  }

  // 形式ゆるめに補正
  if (!privateKey.startsWith("0x")) {
    privateKey = "0x" + privateKey;
  }

  try {
    const wallet = new Wallet(privateKey);

    console.error("Signing with address:", wallet.address);
    console.error("Message:");
    console.error(message);
    console.error("-----");

    const signature = await wallet.signMessage(message);

    // 署名だけを標準出力に出す（他は stderr に出してる）
    console.log(signature);
  } catch (err) {
    console.error("Signing failed:", err);
    process.exit(1);
  }
}

main();

