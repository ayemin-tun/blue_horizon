import { getTierColor } from "./ForecastColor";

export function TierBadge({ tier }: { tier: string }) {
  const colors = getTierColor(tier);
  return (
    <span className={`font-mono text-[11px] tracking-wider font-semibold px-2 py-0.75 rounded-sm whitespace-nowrap ${colors.text} ${colors.bg}`}>
      {tier}
    </span>
  );
}

export function StatusBadge({ label, text, bg }: { label: string; text: string; bg: string }) {
  return (
    <span className={`font-mono text-[11px] tracking-wider font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${text} ${bg}`}>
      {label}
    </span>
  );
}