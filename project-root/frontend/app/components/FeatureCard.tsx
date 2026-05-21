import Link from "next/link";

interface FeatureCardProps {
  id: string;
  icon: string;
  title: string;
  description: string;
  href: string;
  color?: "purple" | "blue" | "accent";
}

const glowColors = {
  purple: "group-hover:shadow-primary/20",
  blue: "group-hover:shadow-secondary/20",
  accent: "group-hover:shadow-accent/20",
};

const borderColors = {
  purple: "group-hover:border-primary/30",
  blue: "group-hover:border-secondary/30",
  accent: "group-hover:border-accent/30",
};

const iconBg = {
  purple: "bg-primary/15 text-primary group-hover:bg-primary/25",
  blue: "bg-secondary/15 text-secondary group-hover:bg-secondary/25",
  accent: "bg-accent/15 text-accent group-hover:bg-accent/25",
};

export default function FeatureCard({
  id,
  icon,
  title,
  description,
  href,
  color = "purple",
}: FeatureCardProps) {
  return (
    <Link
      id={id}
      href={href}
      className={`
        group glass rounded-2xl p-6
        hover:bg-white/[0.06] transition-premium
        hover:shadow-xl ${glowColors[color]}
        ${borderColors[color]}
        hover:-translate-y-1
        block
      `}
    >
      <div
        className={`w-12 h-12 rounded-xl ${iconBg[color]} flex items-center justify-center text-2xl mb-4 transition-premium`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-white/95">
        {title}
      </h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
      <div className="mt-4 flex items-center text-sm font-medium text-muted group-hover:text-primary transition-premium">
        <span>Explore</span>
        <svg
          className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
