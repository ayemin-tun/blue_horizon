import { useSeasonTrendsQuery, SeasonTrendItem } from '@/services/forecastService';
import { SectionHeader } from './SectionHeader';
import { StateMessage } from './StateMessage';
import { SECTION_BADGE } from './ForecastColor';
import { TierBadge } from './Badges';


export function SeasonTrendsSection() {
  const { data, isLoading, isError } = useSeasonTrendsQuery();
  const items: SeasonTrendItem[] = data?.data ?? [];

  return (
    <section className="bg-white border border-[#e3e6ef] shadow-[0_1px_2px_rgba(20,25,40,0.04)] rounded-xl p-6 md:p-7">
      <SectionHeader index={3} title="Seasonality Trends" note="Month-over-month change, PEAK/NORMAL/LOW by share of total" badge={SECTION_BADGE.season} />
      {isLoading && <StateMessage tone="loading" title="Reading the board…" text="Aggregating bookings by month." />}
      {isError && (
        <StateMessage tone="error" title="Forecast engine unreachable" text="Couldn't reach SEASON100. Check the API and try again." />
      )}
      {!isLoading && !isError && items.length === 0 && (
        <StateMessage tone="empty" title="No months yet" text="No confirmed bookings to analyze." />
      )}
      {!isLoading && !isError && items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left font-mono text-[11px] tracking-wider uppercase text-[#8b93a8] font-medium px-2 pb-2.5 border-b border-[#e3e6ef]">Month</th>
                <th className="text-left font-mono text-[11px] tracking-wider uppercase text-[#8b93a8] font-medium px-2 pb-2.5 border-b border-[#e3e6ef]">Bookings</th>
                <th className="text-left font-mono text-[11px] tracking-wider uppercase text-[#8b93a8] font-medium px-2 pb-2.5 border-b border-[#e3e6ef]">MoM</th>
                <th className="text-left font-mono text-[11px] tracking-wider uppercase text-[#8b93a8] font-medium px-2 pb-2.5 border-b border-[#e3e6ef]">Season</th>
                <th className="text-left font-mono text-[11px] tracking-wider uppercase text-[#8b93a8] font-medium px-2 pb-2.5 border-b border-[#e3e6ef]">Next month</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const growthClass =
                  item.mom_growth_pct > 0 ? 'text-[#1f9d63]' : item.mom_growth_pct < 0 ? 'text-[#c8443a]' : 'text-[#8b93a8]';
                const arrow = item.mom_growth_pct > 0 ? '▲' : item.mom_growth_pct < 0 ? '▼' : '—';
                const isLast = idx === items.length - 1;
                return (
                  <tr key={item.year_month}>
                    <td className={`px-2 py-2.5 text-[14px] text-[#161a2c] ${isLast ? '' : 'border-b border-[#e3e6ef]'}`}>{item.month_label}</td>
                    <td className={`px-2 py-2.5 font-mono text-[14px] text-[#161a2c] ${isLast ? '' : 'border-b border-[#e3e6ef]'}`}>{item.total_bookings}</td>
                    <td className={`px-2 py-2.5 font-mono text-[13px] ${growthClass} ${isLast ? '' : 'border-b border-[#e3e6ef]'}`}>
                      {arrow} {Math.abs(item.mom_growth_pct).toFixed(1)}%
                    </td>
                    <td className={`px-2 py-2.5 text-[14px] ${isLast ? '' : 'border-b border-[#e3e6ef]'}`}>
                      <TierBadge tier={item.season_level} />
                    </td>
                    <td className={`px-2 py-2.5 font-mono text-[14px] text-[#161a2c] ${isLast ? '' : 'border-b border-[#e3e6ef]'}`}>{item.forecast_next_month}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}