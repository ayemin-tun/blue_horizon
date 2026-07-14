export function ReportHeader({ onRerun }: { onRerun: () => void }) {
  return (
    <div className="bg-white border border-[#e3e6ef] shadow-[0_1px_2px_rgba(20,25,40,0.04)] rounded-xl px-6 py-5 flex justify-between items-center flex-wrap gap-3">
      <div>
        <h2 className="font-space font-semibold text-[19px] text-[#161a2c] m-0">COBOL Core Output: Forecast Result Report</h2>
        <p className="text-xs text-[#6b7386] mt-1 mb-0">High-fidelity predictive metrics compiled across all parameters.</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] tracking-wider font-semibold px-2.5 py-1 rounded-full text-[#1f9d63] bg-[#e4f6ec]">
          STATUS: SUCCESSFULLY FORECAST
        </span>
        <button
          type="button"
          onClick={onRerun}
          className="font-mono text-xs text-[#6b7386] hover:text-[#161a2c] border border-[#e3e6ef] rounded-md px-3 py-1.5 bg-transparent cursor-pointer transition-colors duration-150"
        >
          Re-run engine
        </button>
      </div>
    </div>
  );
}