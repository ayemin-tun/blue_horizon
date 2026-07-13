'use client';

import { ReportKind } from '@/services/reportService';
import StatusPill from './StatusPill';
import { formatMMK } from './reportConfig';

type Column = { key: string; label: string; render?: (row: any) => React.ReactNode };

function getColumns(kind: ReportKind): Column[] {
  switch (kind) {
    case 'sales-summary':
      return [
        { key: 'ticket_id', label: 'Ticket Id' },
        { key: 'date', label: 'Date' },
        { key: 'route', label: 'Route' },
        { key: 'class', label: 'Class' },
        { key: 'price', label: 'Price', render: (r) => Math.round(r.price).toLocaleString('en-US') },
        { key: 'status', label: 'Status', render: (r) => <StatusPill value={r.status} /> },
      ];
    case 'route-demand':
      return [
        { key: 'route', label: 'Route' },
        { key: 'total_bookings', label: 'Total Bookings' },
        { key: 'demand_level', label: 'Demand', render: (r) => <StatusPill value={r.demand_level} /> },
        { key: 'forecast_next_month', label: 'Forecast (next mo.)' },
      ];
    case 'agent-performance':
      return [
        { key: 'agent_name', label: 'Agent' },
        { key: 'total_bookings', label: 'Total Bookings' },
        { key: 'total_revenue', label: 'Total Revenue', render: (r) => formatMMK(r.total_revenue) },
        { key: 'performance_tier', label: 'Tier', render: (r) => <StatusPill value={r.performance_tier} /> },
      ];
    case 'season-trends':
      return [
        { key: 'month_label', label: 'Month' },
        { key: 'total_bookings', label: 'Bookings' },
        {
          key: 'mom_growth_pct',
          label: 'MoM Growth',
          render: (r) =>
            `${r.mom_growth_pct > 0 ? '▲' : r.mom_growth_pct < 0 ? '▼' : '—'} ${Math.abs(r.mom_growth_pct).toFixed(1)}%`,
        },
        { key: 'season_level', label: 'Season', render: (r) => <StatusPill value={r.season_level} /> },
        { key: 'forecast_next_month', label: 'Forecast (next mo.)' },
      ];
    case 'airline-share':
    default:
      return [
        { key: 'airline_name', label: 'Airline' },
        { key: 'total_bookings', label: 'Total Bookings' },
        { key: 'total_revenue', label: 'Total Revenue', render: (r) => formatMMK(r.total_revenue) },
        { key: 'share_tier', label: 'Tier', render: (r) => <StatusPill value={r.share_tier} /> },
      ];
  }
}

export default function ReportTable({ kind, rows }: { kind: ReportKind; rows: any[] }) {
  if (rows.length === 0) {
    return <p className="empty">No data for this scope yet.</p>;
  }

  const columns = getColumns(kind);

  return (
    <table className="reportTable">
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key}>{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map((c) => (
              <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
      <style jsx>{`
        .reportTable {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
        }
        .reportTable th {
          text-align: left;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #6b7385;
          padding: 0 0.6rem 0.6rem;
          border-bottom: 1px solid #e3e6ee;
        }
        .reportTable td {
          padding: 0.65rem 0.6rem;
          border-bottom: 1px solid #eef0f5;
        }
        .empty {
          color: #9098a8;
          padding: 2rem 0;
          text-align: center;
        }
      `}</style>
    </table>
  );
}