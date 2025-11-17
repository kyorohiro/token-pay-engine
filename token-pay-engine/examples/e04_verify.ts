//
// Example: Verify a signed message
// npx tsx examples/e04_verify.ts "hello world" "0xd1f182632525bb427d1e524f3ebf708d0635d789ee562ae4024c86756ab246ff645b104ef1e30bffe9fd4392af99154c4fcdaf5bfb6b6b3de41b13a1edb1ecbd1b"
//
import { verifyMessage } from "ethers";


function printUsage() {
  console.log(`
Usage:
  ETH_PRIVATE_KEY=0x... npx tsx verify.js "<message>" "<signature>"
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  console.log("Verifying signature...", args);
  const message = args[0];
  const signature = args[1];
  const recovered = verifyMessage(message, signature);
  console.log("Recovered Address:", recovered);
}

main();
