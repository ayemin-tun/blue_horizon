'use client';

import { formatMMK } from "./reportConfig";


type Summary = {
  total_revenue: number;
  ticket_issues: number;
  average_ticket_sale: number;
};

export default function SalesSummaryCards({ summary }: { summary?: Summary }) {
  if (!summary) return null;
  return (
    <div className="cardsRow">
      <div className="summaryCard">
        <span className="summaryLabel">Total Revenue</span>
        <strong className="summaryValue">{formatMMK(summary.total_revenue)}</strong>
      </div>
      <div className="summaryCard">
        <span className="summaryLabel">Ticket Issues</span>
        <strong className="summaryValue summaryRed">{summary.ticket_issues} Units</strong>
      </div>
      <div className="summaryCard">
        <span className="summaryLabel">Average Ticket Sale</span>
        <strong className="summaryValue">{formatMMK(summary.average_ticket_sale)}</strong>
      </div>
      <style jsx>{`
        .cardsRow {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.4rem;
        }
        .summaryCard {
          flex: 1;
          min-width: 12rem;
          border: 1px solid #e3e6ee;
          border-radius: 0.5rem;
          padding: 0.9rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .summaryLabel {
          font-size: 0.78rem;
          color: #6b7385;
        }
        .summaryValue {
          font-size: 1.05rem;
          color: #1c2b4a;
        }
        .summaryRed {
          color: #c0392b;
        }
      `}</style>
    </div>
  );
}
