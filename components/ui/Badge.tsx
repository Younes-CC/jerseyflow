// Kleines farbiges Label für Status-Anzeigen
type BadgeColor = "green" | "red" | "orange" | "blue" | "gray" | "yellow" | "purple";

interface BadgeProps {
  label: string;
  color: BadgeColor;
}

const colorMap: Record<BadgeColor, string> = {
  green: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  orange: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  blue: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  gray: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export default function Badge({ label, color }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorMap[color]}`}
    >
      {label}
    </span>
  );
}
