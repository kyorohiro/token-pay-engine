// src/lib/tinyCrypt.ts
import type { HDNodeWallet } from "ethers";
import { Wallet } from "ethers";

/**
 * privateKey を ethers の keystore JSON に暗号化する
 * （パスワードはアプリ側で聞く）
 */
export async function encryptPrivateKeyToKeystoreJson(
  privateKey: string,
  password: string,
): Promise<string> {
  const normalizedPassword = password.trim().normalize("NFKC");
  const wallet = new Wallet(privateKey);
  const json = await wallet.encrypt(normalizedPassword);
  return json; // これをそのまま localStorage などに保存してOK
}

/**
 * keystore JSON + password から Wallet に復号する
 */
export async function decryptKeystoreJsonToWallet(
  keystoreJson: string,
  password: string
): Promise<Wallet| HDNodeWallet> {
  const normalizedPassword = password.trim().normalize("NFKC");
  const wallet = await Wallet.fromEncryptedJson(keystoreJson, normalizedPassword);
  return wallet;
}

