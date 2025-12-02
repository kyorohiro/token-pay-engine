// src/pages/SetupPage.tsx
import React from "react";
import "../index.css";
import { useWalletStorage } from "../libs/useWalletStorage";
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type SetupPageProps = {
  // onCreateNew: () => void;
  // onImport: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const SetupPage: React.FC<SetupPageProps> = () => {
 const { 
  save
  //state, 
      //wallet, meta, unlock, save, burn 
    } = useWalletStorage();
  const onCreateNew = async () => {
    // 新規ウォレット作成ロジックをここに追加
    console.log("新規ウォレット作成");
    // TODO ダイアログを表示してパスワードを取得し、ウォレットを作成
    //
    // TODO ここで、実際に保存 
    save("newlyGeneratedPrivateKey", "userPassword", { target: "ethereum"})
  }

  const onImport = async () => {
    // インポートロジックをここに追加
    console.log("ウォレットインポート");
    save("importedPrivateKey", "userPassword", { target: "ethereum"})
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-md px-6 py-8 bg-slate-900/80 border border-slate-700 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold tracking-tight text-center">
          Temporary Burner Wallet
        </h1>
        <p className="mt-2 text-xs text-slate-400 text-center">
          一時的に使い捨てるためのシンプルなウォレット
        </p>

        <div className="mt-8 space-y-4">
          <button
            type="button"
            onClick={onCreateNew}
            className="w-full px-4 py-3 text-sm font-medium rounded-xl
                       bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700
                       transition-colors"
          >
            新規作成
          </button>

          <button
            type="button"
            onClick={onImport}
            className="w-full px-4 py-3 text-sm font-medium rounded-xl
                       border border-slate-600 bg-slate-900 hover:bg-slate-800
                       active:bg-slate-950 transition-colors"
          >
            インポート
          </button>
        </div>
      </div>
    </div>
  );
};

export {
    SetupPage
}

export type {
    SetupPageProps
}