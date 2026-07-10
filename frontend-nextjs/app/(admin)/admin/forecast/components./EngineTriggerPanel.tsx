export const ENGINE_LOG_LINES = [
  "BH-COBOL-PROC :: STARTING BATCH RESERVATION ANALYSIS ENGINE...",
  "SYSTEM CHECK :: CHECKING STATIC FILES MODULE...",
  "SYS-DATA-LOAD :: OPENING DATA FILE INPUT 'SALES_DATA.DAT' SEQUENTIAL ACCESS",
  "PROCESSING :: READING RECORD BLOCK 001 - 500 (TICKETS & RESERVATIONS)...",
  "PROCESSING :: COUNTING ACCUMULATED REVENUE VIA COBOL ADD STATEMENT...",
  "CALCULATING :: COEFFICIENTS FOR REGRESSION MODELLING...",
  "PREDICT-MOD :: PROJECTING SEASONAL DEMAND PATTERNS FOR NEXT 6 MONTHS...",
  "SYS-DATA-OUT :: WRITING REPORT TO 'FORECAST_REPORT.TXT'...",
  "BH-COBOL-PROC :: BATCH PROCESS COMPLETED SUCCESSFULLY (RETURN CODE: 0000).",
];

export function EngineTriggerPanel({
  onRun,
  running,
  visibleLines,
}: {
  onRun: () => void;
  running: boolean;
  visibleLines: number;
}) {
  return (
    <div className="max-w-272 mx-auto flex flex-col gap-5">
      <div className="bg-white border border-[#e3e6ef] shadow-[0_1px_2px_rgba(20,25,40,0.04)] rounded-xl p-7">
        <p className="font-mono text-[13px] tracking-wide text-[#8b93a8] mb-1 flex items-center gap-2 ">
          <span className="text-[#b8791f]">{'>_'}</span> Cobol Sequential Batch Predictor
        </p>
        <h2 className="font-space font-semibold text-lg text-[#161a2c] mt-0 mb-8">
          Run the COBOL core engine to compute the four forecasting dimensions
        </h2>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#12172a] border border-[#232b45] rounded-lg px-5 py-8 mb-6">
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-[#8b93a8] font-mono uppercase tracking-wider">Database String</dt>
            <dd className="text-[#4fb8a8] font-mono text-sm m-0">SQLite → Sequential COBOL</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-[#8b93a8] font-mono uppercase tracking-wider">Analysis Compiler</dt>
            <dd className="text-[#8fa8ff] font-mono text-sm m-0">GnuCOBOL v3.1</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={onRun}
          disabled={running}
          className="w-full py-3.5 rounded-lg border-none font-space font-semibold text-sm tracking-wide text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
        >
          {running ? 'RUNNING…' : 'RUN COBOL FORECASTING ENGINE'}
        </button>
      </div>

      {running && (
        <div className="bg-[#0a0e1a] border border-[#232b45] rounded-xl p-6 font-mono text-[13px] leading-[1.9]">
          <p className="text-[#8b93a8] tracking-widest text-xs uppercase mb-3">BH-Terminal :: Console Engine Logs</p>
          <div className="h-px bg-[#232b45] mb-4" />
          <ul className="list-none m-0 p-0 flex flex-col gap-1.5">
            {ENGINE_LOG_LINES.slice(0, visibleLines).map((line, i) => (
              <li key={i} className="text-[#c7d0e0] flex gap-2">
                <span className="text-[#e8a94c]">{'›'}</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}