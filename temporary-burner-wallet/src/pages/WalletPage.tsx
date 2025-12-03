// src/pages/WalletPage.tsx
import React, { useEffect, useRef } from "react";
import { useWalletStorage } from "../libs/useWalletStorage";
import { useDialog } from "../libs/useDialog";
import { downloadTextFile, getSecretPhraseFromWallet } from "../libs/walletBackup";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type WalletPageProps = {
    // onBurn: () => void;   // Burnされたら Setup に戻す
};

// eslint-disable-next-line no-empty-pattern
const WalletPage: React.FC<WalletPageProps> = ({ }) => {
    const {
        state,
        wallet,
        // meta,
        unlock,
        //  save, 
        burn
    } = useWalletStorage();
    const {
        showInputPasswordDialog, showConfirmDialog,
    } = useDialog();
    const address = wallet?.address ?? "";
    const promptedRef = useRef(false);
    useEffect(() => {
        // setAddress(wallet ? wallet.address : "");
        // すでにこの locked フェーズでダイアログ出してたら何もしない
        if (state != "locked") {
            promptedRef.current = false;
            return;
        }
        if (promptedRef.current) return;
        promptedRef.current = true;
        const run = async () => {
            console.log("> WalletPage: state=", state);
            if (state == "locked") {
                const password = await showInputPasswordDialog();
                try {
                    const result = await unlock(password ?? "");
                    if (!result) {
                        run(); // 再度パスワード入力を促す
                    }
                } catch (error) {
                    console.error("Failed to unlock wallet:", error);
                    run(); // 再度パスワード入力を促す
                }
            }
        };
        run();
    }, [state, showInputPasswordDialog, unlock]);
    const onBurn = async () => {
        console.log("ウォレットをBurnします");
        const secret = getSecretPhraseFromWallet(wallet!);
        if (!secret) {
            await showConfirmDialog({
                title: "バックアップエラー",
                body: "バックアップ用の秘密情報を取得できませんでした。\nこの状態ではウォレットを削除しないでください。",
                okText: "OK",
                // cancelText は省略可（シンプルな OK ダイアログにする）
            });
            return;
        }

        await downloadTextFile("wallet_backup.txt", secret);
        //
        const resut = await showConfirmDialog({
            title: "ウォレットのBurn",
            body:
                "ウォレットのバックアップを保存しましたか？\n本当にウォレットを削除してSetup画面に戻りますか？",
            okText: "はい、Burnします",
            cancelText: "キャンセル",
        });
        if (resut) {
            burn();
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
            <div className="w-full max-w-lg px-6 py-8 bg-slate-900/80 border border-slate-700 rounded-2xl shadow-xl space-y-6">
                <header>
                    <h1 className="text-xl font-semibold tracking-tight">
                        Wallet
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        ここにウォレット情報（アドレス・残高など）を表示していく。
                    </p>
                </header>

                <section className="space-y-2">
                    <p className="text-sm text-slate-300">
                        （TODO）ここに:
                    </p>
                    <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                        <li>ネットワーク名</li>
                        <li>ウォレットアドレス : {address}</li>
                        <li>残高</li>
                        <li>Backup / Burn ボタン</li>
                    </ul>
                </section>

                <footer className="pt-4 border-t border-slate-800">
                    <button
                        type="button"
                        onClick={onBurn}
                        className="px-4 py-2 text-xs font-medium rounded-lg bg-rose-600 hover:bg-rose-500 active:bg-rose-700"
                    >
                        Burn（ウォレット削除してSetupへ戻る）
                    </button>
                </footer>
            </div>
        </div>
    );
};

export {
    WalletPage
}

export type {
    WalletPageProps
}