// src/pages/SetupPage.tsx
import React, { useState } from "react";
import "../index.css";
import { Wallet } from "ethers";
import { useWalletStorage } from "../libs/useWalletStorage";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type SetupPageProps = {};

const SetupPage: React.FC<SetupPageProps> = () => {
  const { save } = useWalletStorage();

  const [dialogMode, setDialogMode] = useState<"none" | "create" | "import">(
    "none"
  );
  const [password, setPassword] = useState("");
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const openCreateDialog = () => {
    setDialogMode("create");
    setPassword("");
    setPrivateKeyInput("");
    setError(null);
  };

  const openImportDialog = () => {
    setDialogMode("import");
    setPassword("");
    setPrivateKeyInput("");
    setError(null);
  };

  const closeDialog = () => {
    if (isBusy) return;
    setDialogMode("none");
    setPassword("");
    setPrivateKeyInput("");
    setError(null);
  };

  const handleDialogSubmit = async () => {
    if (!password.trim()) {
      setError("パスワードを入力してください");
      return;
    }

    try {
      setIsBusy(true);
      setError(null);

      if (dialogMode === "create") {
        // 2) Wallet を作成
        const wallet = Wallet.createRandom();
        const privateKey = wallet.privateKey;

        // 3) 保存
        await save(privateKey, password, { target: "ethereum" });
      } else if (dialogMode === "import") {
        if (!privateKeyInput.trim()) {
          setError("インポートする秘密鍵を入力してください");
          setIsBusy(false);
          return;
        }

        await save(privateKeyInput.trim(), password, { target: "ethereum" });
      }

      // save が終わると Context 経由で state が "unlocked" になり、
      // App 側の切り替えで WalletPage に遷移する想定
      closeDialog();
    } catch (e) {
      console.error(e);
      setError("ウォレットの保存に失敗しました");
    } finally {
      setIsBusy(false);
    }
  };

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
            onClick={openCreateDialog}
            className="w-full px-4 py-3 text-sm font-medium rounded-xl
                       bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700
                       transition-colors"
          >
            新規作成
          </button>

          <button
            type="button"
            onClick={openImportDialog}
            className="w-full px-4 py-3 text-sm font-medium rounded-xl
                       border border-slate-600 bg-slate-900 hover:bg-slate-800
                       active:bg-slate-950 transition-colors"
          >
            インポート
          </button>
        </div>
      </div>

      {/* パスワード/秘密鍵入力ダイアログ */}
      {dialogMode !== "none" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold">
              {dialogMode === "create" ? "新規ウォレット作成" : "ウォレットインポート"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              ローカルにのみ保存される一時的なウォレットです。
            </p>

            {dialogMode === "import" && (
              <div className="mt-4">
                <label className="block text-xs text-slate-300 mb-1">
                  秘密鍵
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="0x から始まる秘密鍵"
                  value={privateKeyInput}
                  onChange={(e) => setPrivateKeyInput(e.target.value)}
                  disabled={isBusy}
                />
              </div>
            )}

            <div className="mt-4">
              <label className="block text-xs text-slate-300 mb-1">
                パスワード
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="このウォレット用のパスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isBusy}
              />
            </div>

            {error && (
              <p className="mt-3 text-xs text-red-400">
                {error}
              </p>
            )}

            <div className="mt-6 flex gap-2 justify-end">
              <button
                type="button"
                onClick={closeDialog}
                disabled={isBusy}
                className="px-3 py-2 text-xs rounded-lg border border-slate-600
                           bg-slate-900 hover:bg-slate-800 disabled:opacity-60"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDialogSubmit}
                disabled={isBusy}
                className="px-4 py-2 text-xs font-medium rounded-lg
                           bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60"
              >
                {isBusy ? "保存中..." : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { SetupPage };
export type { SetupPageProps };
