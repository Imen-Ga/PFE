export default function KpiCard({
  label, value, sub, valueColor = "text-neutral-900",
  iconBg, iconColor, icon,
}: {
  label: string; value: number; sub: string;
  valueColor?: string; iconBg: string; iconColor: string; icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-100 px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        <p className="text-xs text-neutral-400">{label}</p>
      </div>
      <p className={`text-3xl font-semibold leading-none ${valueColor}`}>{value}</p>
      <p className="text-xs text-neutral-400 mt-2">{sub}</p>
    </div>
  );
}