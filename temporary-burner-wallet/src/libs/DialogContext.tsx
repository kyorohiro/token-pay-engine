// src/libs/DialogContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type DialogResult = "ok" | "cancel";

export type DialogOptions = {
  title?: string;
  body: ReactNode;        // ここに <>...</> を渡せる
  okText?: string;
  cancelText?: string;
};

type DialogState = DialogOptions & { id: number };

type DialogContextValue = {
  showDialog: (opts: DialogOptions) => Promise<DialogResult>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ダイアログのスタック
  const [stack, setStack] = useState<DialogState[]>([]);
  // id -> resolve のマップ
  const resolversRef = useRef<Map<number, (result: DialogResult) => void>>(new Map());
  const idRef = useRef(1);

  const showDialog = useCallback((opts: DialogOptions): Promise<DialogResult> => {
    return new Promise<DialogResult>((resolve) => {
      const id = idRef.current++;
      const dialog: DialogState = {
        id,
        okText: "OK",
        cancelText: "キャンセル",
        ...opts,
      };

      setStack((prev) => [...prev, dialog]);
      resolversRef.current.set(id, resolve);
    });
  }, []);

  // 一番上のダイアログを閉じる
  const closeTop = (result: DialogResult) => {
    setStack((prev) => {
      if (prev.length === 0) return prev;

      const top = prev[prev.length - 1];
      const next = prev.slice(0, -1);

      const resolver = resolversRef.current.get(top.id);
      if (resolver) {
        resolver(result);
        resolversRef.current.delete(top.id);
      }

      return next;
    });
  };

  const top = stack[stack.length - 1] ?? null;

  return (
    <DialogContext.Provider value={{ showDialog }}>
      {children}

      {/* いま一番上にあるダイアログだけ描画 */}
      {top && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl">
            {top.title && (
              <h2 className="text-lg font-semibold">{top.title}</h2>
            )}
            <div className="mt-3 text-sm text-slate-100">
              {top.body}
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => closeTop("cancel")}
                className="px-3 py-2 text-xs rounded-lg border border-slate-600
                           bg-slate-900 hover:bg-slate-800"
              >
                {top.cancelText ?? "キャンセル"}
              </button>
              <button
                type="button"
                onClick={() => closeTop("ok")}
                className="px-4 py-2 text-xs font-medium rounded-lg
                           bg-emerald-600 hover:bg-emerald-500"
              >
                {top.okText ?? "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog must be used within <DialogProvider />");
  }
  return ctx;
}
