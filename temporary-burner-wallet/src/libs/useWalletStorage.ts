// src/hooks/useWalletStorage.ts
import { useCallback, useState } from "react";
import type { Wallet } from "ethers";
import type { HDNodeWallet } from "ethers";
import {
  saveWalletToStorage,
  loadWalletFromStorage,
  clearStoredWallet,
  hasStoredWallet,
} from "./walletStorage";
import type { WalletMeta } from "./walletStorage";

export type WalletStatus = "no-data" | "locked" | "unlocked" | "error";

type UnlockedWallet = {
  wallet: Wallet | HDNodeWallet;
  meta: WalletMeta;
};

export type UseWalletStorageResult = {
  status: WalletStatus;

  // データ有無だけ欲しいとき用
  hasStored: boolean;

  // unlocked のときだけ非 null
  wallet: Wallet | HDNodeWallet | null;
  meta: WalletMeta | null;

  // ローディング/エラー
  isBusy: boolean;
  error: string | null;

  /**
   * 既存データをパスワードで復号する (ログイン相当)
   * 戻り値 true: 成功 / false: 失敗
   */
  unlock: (password: string) => Promise<boolean>;

  /**
   * 新規作成 or インポート時
   * セーブして、そのまま unlocked 状態にする
   */
  createOrImport: (
    privateKey: string,
    password: string,
    meta: WalletMeta
  ) => Promise<void>;

  /**
   * 完全削除（Burn）
   */
  burn: () => void;

  /**
   * error を明示的に消したいとき用
   */
  resetError: () => void;
};

function getInitialStatus(): WalletStatus {
  if (typeof window === "undefined") {
    // SSR 対策（一応）
    return "no-data";
  }
  return hasStoredWallet() ? "locked" : "no-data";
}

/**
 * localStorage ベースの一時的 Burner Wallet を扱う hook
 */
export function useWalletStorage(): UseWalletStorageResult {
  const [status, setStatus] = useState<WalletStatus>(getInitialStatus);
  const [unlocked, setUnlocked] = useState<UnlockedWallet | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasStored = status === "locked" || status === "unlocked";

  const unlock = useCallback(async (password: string) => {
    setIsBusy(true);
    setError(null);
    try {
      const result = await loadWalletFromStorage(password);
      if (!result) {
        // パスワード違い or データ破損
        const stillExists = hasStoredWallet();
        setStatus(stillExists ? "error" : "no-data");
        setUnlocked(null);
        setError("パスフレーズが違うか、保存データが壊れています。");
        return false;
      }

      setUnlocked(result);
      setStatus("unlocked");
      return true;
    } catch (e) {
      console.error(e);
      setStatus("error");
      setUnlocked(null);
      setError("ウォレットの復号に失敗しました。");
      return false;
    } finally {
      setIsBusy(false);
    }
  }, []);

  const createOrImport = useCallback(
    async (privateKey: string, password: string, meta: WalletMeta) => {
      setIsBusy(true);
      setError(null);
      try {
        // 保存
        await saveWalletToStorage(privateKey, password, meta);

        // 復号してメモリ上にも展開（UX 的にこのまま unlocked にしてしまう）
        const result = await loadWalletFromStorage(password);
        if (!result) {
          setStatus("error");
          setUnlocked(null);
          setError("ウォレットの保存または復号に失敗しました。");
          return;
        }

        setUnlocked(result);
        setStatus("unlocked");
      } catch (e) {
        console.error(e);
        setStatus("error");
        setUnlocked(null);
        setError("ウォレットの保存に失敗しました。");
      } finally {
        setIsBusy(false);
      }
    },
    []
  );

  const burn = useCallback(() => {
    clearStoredWallet();
    setStatus("no-data");
    setUnlocked(null);
    setError(null);
  }, []);

  const resetError = useCallback(() => {
    setError(null);
    // error 状態から locked に戻したいケースがあればここで調整
    if (status === "error" && hasStoredWallet()) {
      setStatus("locked");
    }
  }, [status]);

  return {
    status,
    hasStored,
    wallet: unlocked?.wallet ?? null,
    meta: unlocked?.meta ?? null,
    isBusy,
    error,
    unlock,
    createOrImport,
    burn,
    resetError,
  };
}

