// src/pages/SetupPage.tsx
import React, { useCallback, useRef, useState } from "react";
import "../index.css";
import { Wallet } from "ethers";
import { useWalletStorage } from "../libs/useWalletStorage";
import { useDialog } from "../libs/DialogContext";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type SetupPageProps = {};

const SetupPage: React.FC<SetupPageProps> = () => {
  const { save } = useWalletStorage();
  const { showConfirmDialog } = useDialog();

  // --- ダイアログ用の state ---
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogPassword, setDialogPassword] = useState("");
  const [dialogError, setDialogError] = useState<string | null>(null);

  // Promise の resolve を保持する
  const dialogResolveRef = useRef<((password: string | null) => void) | null>(
    null
  );

  // ここが「命令的 API」相当
  const showInputPasswordDialog = useCallback((): Promise<string | null> => {
    return new Promise<string | null>((resolve) => {
      dialogResolveRef.current = resolve;
      setDialogPassword("");
      setDialogError(null);
      setDialogOpen(true);
    });
  }, []);

  const handleDialogOk = () => {
    if (!dialogPassword.trim()) {
      setDialogError("パスワードを入力してください");
      return;
    }
    if (dialogResolveRef.current) {
      dialogResolveRef.current(dialogPassword);
      dialogResolveRef.current = null;
    }
    setDialogOpen(false);
  };

  const handleDialogCancel = () => {
    if (dialogResolveRef.current) {
      // キャンセル時は null を返すようにしておく
      dialogResolveRef.current(null);
      dialogResolveRef.current = null;
    }
    setDialogOpen(false);
  };

  // --- ボタンハンドラ ---

  const onCreateNew = async () => {
    console.log("新規ウォレット作成");
    // 確認だけ出してみる例
    const confirm = await showConfirmDialog({
      title: "新規ウォレットを作成",
      body: (
        <p className="text-xs text-slate-300">
          新しい一時ウォレットを作成します。既存のウォレットとは別物として扱われます。
        </p>
      ),
      okText: "作成する",
      cancelText: "やめる",
    });

    if (!confirm) {
      return;
    }
    const password = await showInputPasswordDialog();
    if (!password) {
      // キャンセルされた
      return;
    }

    const wallet = Wallet.createRandom();
    const privateKey = wallet.privateKey;

    await save(privateKey, password, { target: "ethereum" });
    // save が終わると state が "unlocked" になり、App 側で WalletPage に遷移する想定
  };

  const onImport = async () => {
    console.log("ウォレットインポート");
    const password = await showInputPasswordDialog();
    if (!password) {
      return;
    }

    // TODO: 実際はここでインポートする秘密鍵を別の手段（テキスト入力 or QR とか）で取得
    const importedPrivateKey = "importedPrivateKey";
    await save(importedPrivateKey, password, { target: "ethereum" });
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

      {/* ここが「ダイアログの見た目」定義 */}
      {dialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold">パスワード入力</h2>
            <p className="mt-1 text-xs text-slate-400">
              このウォレットの暗号化に使用するパスワードを入力してください。
            </p>

            <div className="mt-4">
              <label className="block text-xs text-slate-300 mb-1">
                パスワード
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={dialogPassword}
                onChange={(e) => setDialogPassword(e.target.value)}
              />
            </div>

            {dialogError && (
              <p className="mt-3 text-xs text-red-400">{dialogError}</p>
            )}

            <div className="mt-6 flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleDialogCancel}
                className="px-3 py-2 text-xs rounded-lg border border-slate-600
                           bg-slate-900 hover:bg-slate-800"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleDialogOk}
                className="px-4 py-2 text-xs font-medium rounded-lg
                           bg-emerald-600 hover:bg-emerald-500"
              >
                OK
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
