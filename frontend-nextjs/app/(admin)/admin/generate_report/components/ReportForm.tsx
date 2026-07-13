'use client';

import { ReportKind } from '@/services/reportService';
import { REPORT_OPTIONS, ReportOption } from './reportConfig';

type Props = {
  selectedReport: ReportKind;
  currentOption: ReportOption;
  dateFrom: string;
  dateTo: string;
  onReportChange: (next: ReportKind) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClearDates: () => void;
  onGenerate: () => void;
};

export default function ReportForm({
  selectedReport,
  currentOption,
  dateFrom,
  dateTo,
  onReportChange,
  onDateFromChange,
  onDateToChange,
  onClearDates,
  onGenerate,
}: Props) {
  return (
    <section className="card no-print">
      <h2 className="cardTitle">📋 Report Generation</h2>

      <div className="formRow">
        <label className="field">
          <span>Select Criteria</span>
          <div className="selectWrap">
            <select value={selectedReport} onChange={(e) => onReportChange(e.target.value as ReportKind)}>
              {REPORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="field" style={{ opacity: currentOption.supportsDateFilter ? 1 : 0.4 }}>
          <span>
            From <em>(optional)</em>
          </span>
          <input
            type="date"
            value={dateFrom}
            disabled={!currentOption.supportsDateFilter}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
        </label>

        <label className="field" style={{ opacity: currentOption.supportsDateFilter ? 1 : 0.4 }}>
          <span>
            To <em>(optional)</em>
          </span>
          <input
            type="date"
            value={dateTo}
            disabled={!currentOption.supportsDateFilter}
            onChange={(e) => onDateToChange(e.target.value)}
          />
        </label>
      </div>

      {currentOption.supportsDateFilter && (dateFrom || dateTo) && (
        <button type="button" className="clearDatesButton" onClick={onClearDates}>
          ✕ Clear dates
        </button>
      )}

      {!currentOption.supportsDateFilter && (
        <p className="hint">
          This report currently covers the entire confirmed-booking history — date-range filtering isn't wired up
          for it yet.
        </p>
      )}

      <button className="primaryButton" onClick={onGenerate}>
        Generate Report
      </button>

      <style jsx>{`
        .card {
          background: #fff;
          border: 1px solid #e3e6ee;
          border-radius: 0.6rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .cardTitle {
          font-size: 1.05rem;
          font-weight: 600;
          margin: 0 0 1.1rem;
        }
        .formRow {
          display: flex;
          gap: 1.25rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }
        .field {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: #566;
          flex: 1;
          min-width: 12rem;
        }
        .field select,
        .field input {
          padding: 0.55rem 0.7rem;
          border: 1px solid #d6dae5;
          border-radius: 0.4rem;
          font-size: 0.9rem;
          font-family: inherit;
          background: #fff;
          color: #1a2233;
        }
        .field em {
          font-style: normal;
          color: #9098a8;
          font-weight: 400;
        }
        .selectWrap {
          position: relative;
        }
        .selectWrap select {
          width: 100%;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          padding-right: 2rem;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%23566' stroke-width='1.5'><path d='M5 7.5L10 12.5L15 7.5'/></svg>");
          background-repeat: no-repeat;
          background-position: right 0.6rem center;
          background-size: 0.9rem;
        }
        .clearDatesButton {
          border: none;
          background: none;
          color: #2b2ea3;
          font-size: 0.8rem;
          cursor: pointer;
          padding: 0 0 1rem;
          text-decoration: underline;
        }
        .hint {
          font-size: 0.78rem;
          color: #9098a8;
          margin: -0.4rem 0 1rem;
        }
        .primaryButton {
          width: 100%;
          background: #2b2ea3;
          color: #fff;
          border: none;
          padding: 0.85rem;
          border-radius: 0.45rem;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
        }
        .primaryButton:hover {
          background: #23237f;
        }
      `}</style>
    </section>
  );
}