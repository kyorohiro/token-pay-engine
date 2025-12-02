// src/lib/walletStorage.ts
import { Wallet } from "ethers";
import {
  encryptPrivateKeyToKeystoreJson,
  decryptKeystoreJsonToWallet,
} from "./appCrypt";
import type { HDNodeWallet } from "ethers";

export type WalletMeta = {
  target: "ethereum" | "polygon" | "sepolia" | string;
  // ここに将来 label や createdAt など増やしてもOK
};

export type StoredWallet = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  keystore: any;    // keystore JSON (オブジェクト)
  meta: WalletMeta; // 独自メタ情報
};

const STORAGE_KEY = "temporary_burner_wallet_v1";

/**
 * 新規作成 or インポート時に呼ぶ: privateKey + meta + password を受け取って保存
 */
export async function saveWalletToStorage(
  privateKey: string,
  password: string,
  meta: WalletMeta
): Promise<void> {
  const keystoreJson = await encryptPrivateKeyToKeystoreJson(privateKey, password);
  const keystoreObj = JSON.parse(keystoreJson);

  const stored: StoredWallet = {
    keystore: keystoreObj,
    meta,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

/**
 * ログイン相当: password から Wallet + meta を復元
 */
export async function loadWalletFromStorage(
  password: string
): Promise<{ wallet: Wallet|HDNodeWallet; meta: WalletMeta } | null> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const stored = JSON.parse(raw) as StoredWallet;
    const keystoreJson = JSON.stringify(stored.keystore);
    const wallet = await decryptKeystoreJsonToWallet(keystoreJson, password);
    return { wallet, meta: stored.meta };
  } catch (e) {
    console.error("Failed to load wallet:", e);
    return null; // パスワード違い or データ破損
  }
}

/**
 * Burn: 完全削除
 */
export function clearStoredWallet() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * ウォレットが保存されているかどうかだけ知りたいとき用
 */
export function hasStoredWallet(): boolean {
  return localStorage.getItem(STORAGE_KEY) != null;
}
