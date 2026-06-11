type ModulePlaceholderProps = {
  title: string;
  description: string;
  items?: string[];
  emptyMessage?: string;
};

export default function ModulePlaceholder({
  title,
  description,
  emptyMessage,
}: ModulePlaceholderProps) {
  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1200px] w-full mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold text-on-surface mb-2">{title}</h1>
        <p className="text-on-surface-variant">{description}</p>
      </div>
      <div className="rounded-xl border border-dashed border-surface-container-high bg-surface-container-low p-10 text-center text-sm text-on-surface-variant">
        {emptyMessage ?? 'This section is not connected to live data yet.'}
      </div>
    </div>
  );
}
