import { StatusBadge } from "./Badges";

export function SectionHeader({
  index,
  title,
  note,
  badge,
}: {
  index: number;
  title: string;
  note: string;
  badge: { label: string; text: string; bg: string };
}) {
  return (
    <div className="flex justify-between items-start flex-wrap gap-3 mb-5">
      <div>
        <h2 className="font-space font-semibold text-[19px] text-[#161a2c] m-0">
          <span className="text-[#b8791f] mr-2">{index}.</span>
          {title}
        </h2>
        <p className="text-xs text-[#8b93a8] mt-1 mb-0">{note}</p>
      </div>
      <StatusBadge {...badge} />
    </div>
  );
}