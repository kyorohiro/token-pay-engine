// src/libs/walletBackup.ts
import type { Wallet, HDNodeWallet } from "ethers";

export function getSecretPhraseFromWallet(wallet: Wallet | HDNodeWallet): string | null {
  // ethers v6: mnemonic は { phrase, path } みたいなオブジェクト
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mnemonicPhrase = (wallet as any).mnemonic?.phrase as string | undefined;

  if (mnemonicPhrase && mnemonicPhrase.length > 0) {
    return mnemonicPhrase;
  }

  // ニーモニックが無い場合は privateKey を使う（最悪の退避手段）
  const privateKey = wallet.privateKey;
  if (privateKey && privateKey.length > 0) {
    return privateKey;
  }

  return null;
}

// src/libs/download.ts
export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}
