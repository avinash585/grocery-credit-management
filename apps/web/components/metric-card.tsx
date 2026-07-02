import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  green: "bg-leaf-50 text-leaf-700",
  yellow: "bg-[#fff7d6] text-[#735d00]",
  blue: "bg-[#e9f3ff] text-[#205b91]",
  red: "bg-[#fff0ec] text-chilli"
};

export function MetricCard({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string; tone: keyof typeof tones }) {
  return (
    <article className="rounded-md bg-white p-5 shadow-soft">
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-md", tones[tone])}>
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <p className="mt-4 text-lg font-semibold text-ink/70">{label}</p>
      <p className="mt-1 text-3xl font-bold text-ink">{value}</p>
    </article>
  );
}

