type ModulePlaceholderProps = {
  title: string;
  description: string;
  items: string[];
};

export default function ModulePlaceholder({ title, description, items }: ModulePlaceholderProps) {
  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1200px] w-full mx-auto">
      <div>
        <h1 className="font-display text-3xl font-bold text-on-surface mb-2">{title}</h1>
        <p className="text-on-surface-variant">{description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item} className="rounded-xl border border-surface-container-high bg-surface-container-low p-5">
            <div className="text-sm font-semibold text-on-surface">{item}</div>
            <div className="mt-2 text-xs text-on-surface-variant">
              Planned as a typed Supabase-backed workflow in this feature module.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
