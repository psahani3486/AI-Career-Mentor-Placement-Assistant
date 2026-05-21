interface StatsCardProps {
  id: string;
  icon: string;
  value: string;
  label: string;
  trend?: string;
  trendUp?: boolean;
  color?: "purple" | "blue" | "accent" | "warning" | "danger";
}

const colorMap = {
  purple: "from-primary/20 to-primary/5 border-primary/20",
  blue: "from-secondary/20 to-secondary/5 border-secondary/20",
  accent: "from-accent/20 to-accent/5 border-accent/20",
  warning: "from-warning/20 to-warning/5 border-warning/20",
  danger: "from-danger/20 to-danger/5 border-danger/20",
};

const iconBgMap = {
  purple: "bg-primary/20 text-primary",
  blue: "bg-secondary/20 text-secondary",
  accent: "bg-accent/20 text-accent",
  warning: "bg-warning/20 text-warning",
  danger: "bg-danger/20 text-danger",
};

export default function StatsCard({
  id,
  icon,
  value,
  label,
  trend,
  trendUp = true,
  color = "purple",
}: StatsCardProps) {
  return (
    <div
      id={id}
      className={`
        glass rounded-2xl p-5 hover:bg-white/[0.06] transition-premium
        bg-gradient-to-br ${colorMap[color]}
        group hover:scale-[1.02] hover:shadow-lg
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBgMap[color]} flex items-center justify-center text-lg`}>
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              trendUp
                ? "bg-accent/15 text-accent"
                : "bg-danger/15 text-danger"
            }`}
          >
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
