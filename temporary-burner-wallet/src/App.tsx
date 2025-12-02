// src/App.tsx
import React, { useState } from "react";
import { SetupPage } from "./pages/SetupPage";
import { WalletPage } from "./pages/WalletPage";

type View = "setup" | "wallet";

const STORAGE_KEY = "burner_wallet_registered";

const App: React.FC = () => {
  const [view, setView] = useState<View>(() => {
    // 初回レンダー時だけ呼ばれる lazy initializer
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "1" ? "wallet" : "setup";
  });

  const registerWallet = () => {
    // TODO: ここで実際のウォレット生成 or インポート処理
    localStorage.setItem(STORAGE_KEY, "1");
    setView("wallet");
  };

  const burnWallet = () => {
    // TODO: ここで実際のウォレット情報削除
    localStorage.removeItem(STORAGE_KEY);
    setView("setup");
  };

  if (view === "wallet") {
    return <WalletPage onBurn={burnWallet} />;
  }

  return (
    <SetupPage
      onCreateNew={registerWallet}
      onImport={registerWallet}
    />
  );
};

export default App;
