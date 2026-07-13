'use client';

import { useState } from 'react';
import {
  useRouteDemandQuery,
  useAgentPerformanceQuery,
  useSeasonTrendsQuery,
  useAirlineShareQuery,
} from '@/services/forecastService';
import { useSalesSummaryQuery, downloadReportCsv, ReportKind } from '@/services/reportService';
import Pagination from '@/components/Pagination'; // TODO: adjust to your actual path
import { PAGE_SIZE, REPORT_OPTIONS } from './components/reportConfig';
import ReportForm from './components/ReportForm';
import SalesSummaryCards from './components/SaleSummaryCards';
import ReportActions from './components/ReportAction';
import ReportTable from './components/ReportTable';


export default function GenerateReportPage() {
  const [selectedReport, setSelectedReport] = useState<ReportKind>('sales-summary');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [generated, setGenerated] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const currentOption = REPORT_OPTIONS.find((o) => o.value === selectedReport)!;
  const isSales = selectedReport === 'sales-summary';

  // each hook only fetches once `generated` is true AND it's the active tab
  const salesQuery = useSalesSummaryQuery(
    { dateFrom, dateTo, search, page, limit: PAGE_SIZE },
    generated && isSales,
  );
  const routeQuery = useRouteDemandQuery(generated && selectedReport === 'route-demand');
  const agentQuery = useAgentPerformanceQuery(generated && selectedReport === 'agent-performance');
  const seasonQuery = useSeasonTrendsQuery(generated && selectedReport === 'season-trends');
  const airlineQuery = useAirlineShareQuery(generated && selectedReport === 'airline-share');

  const activeQuery =
    selectedReport === 'sales-summary' ? salesQuery :
    selectedReport === 'route-demand' ? routeQuery :
    selectedReport === 'agent-performance' ? agentQuery :
    selectedReport === 'season-trends' ? seasonQuery :
    airlineQuery;

  const rows: any[] = (activeQuery.data as any)?.data ?? [];
  const isLoading = generated && activeQuery.isLoading;
  const isError = generated && activeQuery.isError;

  const totalCount: number = (salesQuery.data as any)?.pagination?.total ?? 0;

  function handleReportChange(next: ReportKind) {
    setSelectedReport(next);
    setGenerated(false);
    setPage(1);
    setSearch('');
  }

  function handleGenerate() {
    setPage(1);
    setGenerated(true);
  }

  async function handleDownload() {
    setDownloadError('');
    setDownloading(true);
    try {
      await downloadReportCsv(selectedReport, {
        dateFrom: isSales ? dateFrom : undefined,
        dateTo: isSales ? dateTo : undefined,
        search: isSales ? search : undefined,
      });
    } catch (err) {
      setDownloadError('Download failed — please try again.');
    } finally {
      setDownloading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="page">
      <h1 className="pageTitle">Generate Report</h1>
      <p className="pageSubtitle">Blue Horizon Booking History Dashboard</p>

      <ReportForm
        selectedReport={selectedReport}
        currentOption={currentOption}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onReportChange={handleReportChange}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onClearDates={() => {
          setDateFrom('');
          setDateTo('');
        }}
        onGenerate={handleGenerate}
      />

      {generated && (
        <section className="card printArea">
          <h2 className="cardTitle">{currentOption.label}</h2>
          {isSales && (
            <p className="scopeLine">
              Showing:{' '}
              {dateFrom || dateTo
                ? `${dateFrom || '(no start limit)'} to ${dateTo || '(no end limit)'}`
                : 'All time (no date filter applied)'}
            </p>
          )}

          {isLoading && <p className="stateText">Generating report…</p>}
          {isError && <p className="stateTextError">Couldn't generate this report. Check the API and try again.</p>}

          {!isLoading && !isError && (
            <>
              {isSales && <SalesSummaryCards summary={(salesQuery.data as any)?.summary} />}

              {isSales && (
                <div className="toolbar no-print">
                  <input
                    className="searchInput"
                    placeholder="Search by Ticket Id"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              )}
              {downloadError && <p className="stateTextError">{downloadError}</p>}

              <ReportTable kind={selectedReport} rows={rows} />

              {isSales && (
                <Pagination
                  currentPage={page}
                  totalCount={totalCount}
                  pageSize={PAGE_SIZE}
                  onPageChange={setPage}
                />
              )}

              <ReportActions downloading={downloading} onDownload={handleDownload} onPrint={handlePrint} />
            </>
          )}
        </section>
      )}

      <style jsx>{`
        .page {
          max-width: 68rem;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
          font-family: system-ui, sans-serif;
          color: #1a2233;
        }
        .pageTitle {
          font-size: 1.6rem;
          font-weight: 700;
          margin: 0 0 0.15rem;
        }
        .pageSubtitle {
          color: #6b7385;
          margin: 0 0 1.5rem;
          font-size: 0.9rem;
        }
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
        .scopeLine {
          font-size: 0.82rem;
          color: #6b7385;
          margin: -0.6rem 0 1.2rem;
        }
        .stateText {
          color: #6b7385;
          padding: 2rem 0;
          text-align: center;
        }
        .stateTextError {
          color: #c0392b;
          padding: 0.5rem 0;
        }
        .toolbar {
          margin-bottom: 1rem;
        }
        .searchInput {
          padding: 0.55rem 0.8rem;
          border: 1px solid #d6dae5;
          border-radius: 0.4rem;
          font-size: 0.85rem;
          min-width: 14rem;
        }

        @media print {
          .no-print {
            display: none !important;
          }
          .card {
            border: none;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}