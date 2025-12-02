// src/App.tsx
import React from "react";
import { useWalletStorage } from "./libs/useWalletStorage";
import { SetupPage } from "./pages/SetupPage";
import { WalletPage } from "./pages/WalletPage";

const App: React.FC = () => {
  const { state, 
    //wallet, meta, unlock, save, burn 
  } = useWalletStorage();
  // const { state, unlock, save } = useWalletStorage();
  if (state === "empty" || state === "locked") {
    // 新規作成/インポートモード
    return (
      <SetupPage />
    );
  }

  // state === "unlocked"
  return (
    <WalletPage/>
  );
};

export default App;
