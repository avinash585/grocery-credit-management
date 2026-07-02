import type { ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

export function QuickAction({ icon: Icon, label, ...props }: { icon: LucideIcon; label: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="flex min-h-24 items-center gap-4 rounded-md border border-leaf-100 bg-white p-4 text-left text-xl font-bold text-ink shadow-sm transition hover:border-leaf-600 hover:bg-leaf-50"
      {...props}
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-leaf-600 text-white">
        <Icon className="h-8 w-8" aria-hidden />
      </span>
      <span>{label}</span>
    </button>
  );
}
