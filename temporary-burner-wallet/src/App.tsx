// src/App.tsx
import React from "react";
import { useWalletStorage, } from "./libs/useWalletStorage";
import { SetupPage } from "./pages/SetupPage";
import { WalletPage } from "./pages/WalletPage";

const App: React.FC = () => {
  const {state} = useWalletStorage();
  
  console.log("App: state=", state);
  if (state === "empty" ) {
    // 新規作成/インポートモード
    return (
      <SetupPage />
    );
  }

  // state === "unlocked" || state === "locked"
  return (
    <WalletPage/>
  );
};

export default App;
