// Große Karte für Kennzahlen im Dashboard
interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  accent?: "green" | "red" | "orange" | "blue" | "purple" | "default";
}

const accentMap = {
  green: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20",
  red: "from-red-500/10 to-red-500/5 border-red-500/20",
  orange: "from-orange-500/10 to-orange-500/5 border-orange-500/20",
  blue: "from-sky-500/10 to-sky-500/5 border-sky-500/20",
  purple: "from-purple-500/10 to-purple-500/5 border-purple-500/20",
  default: "from-zinc-800/50 to-zinc-800/30 border-zinc-700/50",
};

const iconAccent = {
  green: "bg-emerald-500/20 text-emerald-400",
  red: "bg-red-500/20 text-red-400",
  orange: "bg-orange-500/20 text-orange-400",
  blue: "bg-sky-500/20 text-sky-400",
  purple: "bg-purple-500/20 text-purple-400",
  default: "bg-zinc-700/50 text-zinc-300",
};

export default function StatCard({ title, value, subtitle, icon, accent = "default" }: StatCardProps) {
  return (
    <div
      className={`bg-gradient-to-br ${accentMap[accent]} border rounded-2xl p-5 flex flex-col gap-3`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400 font-medium">{title}</span>
        <span className={`text-xl w-9 h-9 flex items-center justify-center rounded-xl ${iconAccent[accent]}`}>
          {icon}
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtitle && <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
