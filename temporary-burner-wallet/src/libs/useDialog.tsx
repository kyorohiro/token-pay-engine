// src/hooks/useDialog.tsx
import React, {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from "react";

type DialogItem = {
    id: string;
    node: ReactNode;
};

type DialogContextValue = {
    push: (item: DialogItem) => void;
    pop: (id: string) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [stack, setStack] = useState<DialogItem[]>([]);

    const push = useCallback((item: DialogItem) => {
        setStack((prev) => [...prev, item]);
    }, []);

    const pop = useCallback((id: string) => {
        setStack((prev) => prev.filter((d) => d.id !== id));
    }, []);

    return (
        <DialogContext.Provider value={{ push, pop }}>
            {children}

            {/* 一番上だけ表示するスタック方式 */}
            {stack.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    {stack[stack.length - 1]?.node}
                </div>
            )}
        </DialogContext.Provider>
    );
};

function useDialogCore(): DialogContextValue {
    const ctx = useContext(DialogContext);
    if (!ctx) {
        throw new Error("useDialog must be used within <DialogProvider />");
    }
    return ctx;
}

// ----------------------
// 汎用テキスト入力ダイアログ
// ----------------------

type TextInputDialogOptions = {
    title?: string;
    label?: string;
    placeholder?: string;
    type?: "text" | "password";
    okText?: string;
    cancelText?: string;
    validate?: (value: string) => string | null;
};

const TextInputDialog: React.FC<{
    options: TextInputDialogOptions;
    onSubmit: (value: string) => void;
    onCancel: () => void;
}> = ({ options, onSubmit, onCancel }) => {
    const [value, setValue] = React.useState("");
    const [error, setError] = React.useState<string | null>(null);

    const handleOk = () => {
        if (options.validate) {
            const msg = options.validate(value);
            if (msg) {
                setError(msg);
                return;
            }
        }
        onSubmit(value);
    };

    const handleCancel = () => onCancel();

    return (
        <div className="w-full max-w-sm rounded-2xl bg-slate-900 p-6 shadow-xl border border-slate-700">
            <h2 className="text-lg font-semibold mb-3">
                {options.title ?? "入力"}
            </h2>
            {options.label && (
                <label className="block text-xs text-slate-300 mb-1">
                    {options.label}
                </label>
            )}
            <input
                type={options.type ?? "text"}
                className="w-full rounded-xl bg-slate-800 border border-slate-600 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder={options.placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            {error && (
                <p className="mt-1 text-xs text-red-400">
                    {error}
                </p>
            )}

            <div className="mt-4 flex justify-end gap-2 text-sm">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-800"
                >
                    {options.cancelText ?? "キャンセル"}
                </button>
                <button
                    type="button"
                    onClick={handleOk}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500"
                >
                    {options.okText ?? "OK"}
                </button>
            </div>
        </div>
    );
};

// ----------------------
// 公開フック
// ----------------------

type ShowDialogHelpers<T> = {
    resolve: (value: T | null) => void;
    close: () => void; // resolve(null) のショートカット
};

// eslint-disable-next-line react-refresh/only-export-components
export function useDialog() {
    const { push, pop } = useDialogCore();

    /**
     * 汎用 showDialog
     * 例:
     *   const { showDialog } = useDialog();
     *   const result = await showDialog<boolean>(({ resolve, close }) => (
     *     <MyConfirmDialog onOk={() => resolve(true)} onCancel={close} />
     *   ));
     */
    const showDialog = useCallback(
        <T,>(
            render: (helpers: ShowDialogHelpers<T>) => ReactNode
        ): Promise<T | null> => {
            return new Promise<T | null>((outerResolve) => {
                const id = crypto.randomUUID();

                const resolve = (value: T | null) => {
                    outerResolve(value);
                    pop(id);
                };

                const close = () => resolve(null);

                const node = render({ resolve, close });

                push({ id, node });
            });
        },
        [push, pop]
    );

    /**
     * 汎用テキスト入力ダイアログ
     */
    const showInputDialog = useCallback(
        (options: TextInputDialogOptions): Promise<string | null> => {
            return showDialog<string>(({ resolve, close }) => (
                <TextInputDialog
                    options={options}
                    onSubmit={(v) => resolve(v)}
                    onCancel={close}
                />
            ));
        },
        [showDialog]
    );

    /**
     * パスワード入力ダイアログ
     */
    const showInputPasswordDialog = useCallback(
        (opts?: Omit<TextInputDialogOptions, "type">) => {
            return showInputDialog({
                type: "password",
                title: opts?.title ?? "パスフレーズを入力",
                label: opts?.label ?? "パスフレーズ",
                placeholder: opts?.placeholder ?? "",
                okText: opts?.okText ?? "OK",
                cancelText: opts?.cancelText ?? "キャンセル",
                validate: opts?.validate,
            });
        },
        [showInputDialog]
    );
    // useDialog の中に追加
    type SimpleDialogOptions = {
        title: string;
        body: React.ReactNode;
        okText?: string;
        cancelText?: string;
    };

    const showConfirmDialog = useCallback(
        (opts: SimpleDialogOptions): Promise<boolean | null> => {
            return showDialog<boolean>(({ resolve, close }) => (
                <div className="w-full max-w-sm rounded-2xl bg-slate-900 p-6 shadow-xl border border-slate-700">
                    <h2 className="text-lg font-semibold mb-3">{opts.title}</h2>
                    <div className="text-xs text-slate-300">{opts.body}</div>

                    <div className="mt-4 flex justify-end gap-2 text-sm">
                        <button
                            type="button"
                            onClick={close}
                            className="px-3 py-1.5 rounded-lg border border-slate-600 hover:bg-slate-800"
                        >
                            {opts.cancelText ?? "キャンセル"}
                        </button>
                        <button
                            type="button"
                            onClick={() => resolve(true)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500"
                        >
                            {opts.okText ?? "OK"}
                        </button>
                    </div>
                </div>
            ));
        },
        [showDialog]
    );

    // return に追加
    return {
        showDialog,
        showInputDialog,
        showInputPasswordDialog,
        showConfirmDialog,
    };
}
