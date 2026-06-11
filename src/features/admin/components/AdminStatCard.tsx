import type { LucideIcon } from 'lucide-react';

type AdminStatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  loading?: boolean;
};

export default function AdminStatCard({ label, value, icon: Icon, hint, loading }: AdminStatCardProps) {
  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
          {label}
        </span>
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="font-display text-3xl font-bold text-on-surface leading-none">
        {loading ? '—' : value}
      </div>
      {hint && <div className="text-xs text-on-surface-variant">{hint}</div>}
    </div>
  );
}
