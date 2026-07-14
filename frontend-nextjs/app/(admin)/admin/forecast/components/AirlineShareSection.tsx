import { useAirlineShareQuery, AirlineShareItem } from '@/services/forecastService';
import { SectionHeader } from './SectionHeader';
import { formatMMK, getTierColor, SECTION_BADGE } from './ForecastColor';
import { StateMessage } from './StateMessage';
import { TierBadge } from './Badges';

export function AirlineShareSection() {
  const { data, isLoading, isError } = useAirlineShareQuery();
  const items: AirlineShareItem[] = data?.data ?? [];
  const maxBookings = Math.max(1, ...items.map((i) => i.total_bookings));

  return (
    <section className="bg-white border border-[#e3e6ef] shadow-[0_1px_2px_rgba(20,25,40,0.04)] rounded-xl p-6 md:p-7">
      <SectionHeader index={4} title="Airline Share Preference" note="Share of confirmed bookings across all airlines" badge={SECTION_BADGE.airline} />
      {isLoading && <StateMessage tone="loading" title="Reading the board…" text="Aggregating bookings by airline." />}
      {isError && (
        <StateMessage tone="error" title="Forecast engine unreachable" text="Couldn't reach AIRLINE100. Check the API and try again." />
      )}
      {!isLoading && !isError && items.length === 0 && (
        <StateMessage tone="empty" title="No airlines yet" text="No confirmed bookings to analyze." />
      )}
      {!isLoading && !isError && items.length > 0 && (
        <ul className="list-none m-0 p-0 flex flex-col gap-4.5">
          {items.map((item) => {
            const colors = getTierColor(item.share_tier);
            return (
              <li key={item.airline_id} className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center gap-3">
                  <span className="font-medium text-[15px] text-[#161a2c]">{item.airline_name}</span>
                  <TierBadge tier={item.share_tier} />
                </div>
                <div className="h-2 rounded-full bg-[#eef0f5] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-[width] duration-400 ease-in-out ${colors.fill}`}
                    style={{ width: `${(item.total_bookings / maxBookings) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between font-mono text-xs text-[#8b93a8]">
                  <span>{item.total_bookings} bookings</span>
                  <span>{formatMMK(item.total_revenue)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}