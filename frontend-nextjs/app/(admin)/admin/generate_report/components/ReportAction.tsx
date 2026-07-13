'use client';

type Props = {
  downloading: boolean;
  onDownload: () => void;
  onPrint: () => void;
};

export default function ReportActions({ downloading, onDownload, onPrint }: Props) {
  return (
    <div className="no-print mt-4 flex justify-end gap-3">
      {/* Download Button - Primary Blue Style */}
      <button 
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5" 
        onClick={onDownload} 
        disabled={downloading}
      >
        {downloading ? (
          <>
            Preparing CSV…
          </>
        ) : (
          <>
            <span>⬇</span> Download CSV
          </>
        )}
      </button>

      {/* Print Button - Secondary Outline Blue Style */}
      <button 
        className="rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100/70 hover:border-blue-300 active:bg-blue-100 cursor-pointer flex items-center gap-1.5" 
        onClick={onPrint}
      >
        <span>🖶</span> Print
      </button>
    </div>
  );
}