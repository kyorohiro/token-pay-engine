// src/hooks/useWalletStorage.ts
import { useCallback, useState, createContext, useContext, type ReactNode } from "react";
import type { Wallet, HDNodeWallet } from "ethers";
import {
  saveWalletToStorage,
  loadWalletFromStorage,
  clearStoredWallet,
  hasStoredWallet,
} from "./walletStorage";
import type { WalletMeta } from "./walletStorage";

export type WalletViewState = "empty" | "locked" | "unlocked";

type Unlocked = {
  wallet: Wallet | HDNodeWallet;
  meta: WalletMeta;
};

export type WalletStorageValue = {
  state: WalletViewState;
  wallet: Wallet | HDNodeWallet | null;
  meta: WalletMeta | null;
  unlock: (password: string) => Promise<boolean>;
  save: (privateKey: string, password: string, meta: WalletMeta) => Promise<void>;
  burn: () => void;
};

// ---- コア hook: Provider の中だけで使う ----
function useWalletStorageCore(): WalletStorageValue {
  const [state, setState] = useState<WalletViewState>(() => {
    if (typeof window === "undefined") return "empty";
    return hasStoredWallet() ? "locked" : "empty";
  });

  const [unlocked, setUnlocked] = useState<Unlocked | null>(null);

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    const result = await loadWalletFromStorage(password);
    if (!result) {
      // パスワード違い or データ破損
      return false;
    }
    setUnlocked(result);
    setState("unlocked");
    return true;
  }, []);

  const save = useCallback(
    async (privateKey: string, password: string, meta: WalletMeta) => {
      await saveWalletToStorage(privateKey, password, meta);
      const result = await loadWalletFromStorage(password);
      if (result) {
        setUnlocked(result);
        setState("unlocked");
      } else {
        setUnlocked(null);
        setState("locked");
      }
    },
    []
  );

  const burn = useCallback(() => {
    clearStoredWallet();
    setUnlocked(null);
    setState("empty");
  }, []);

  return {
    state,
    wallet: unlocked?.wallet ?? null,
    meta: unlocked?.meta ?? null,
    unlock,
    save,
    burn,
  };
}

// ---- Context & Provider & 公開用 hook ----

const WalletStorageContext = createContext<WalletStorageValue | null>(null);

export const WalletStorageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value = useWalletStorageCore();
  return (
    <WalletStorageContext.Provider value={value}>
      {children}
    </WalletStorageContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useWalletStorage(): WalletStorageValue {
  const ctx = useContext(WalletStorageContext);
  if (!ctx) {
    throw new Error("useWalletStorage must be used within <WalletStorageProvider />");
  }
  return ctx;
}
