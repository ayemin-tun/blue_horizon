export default function BarcodeStrip({ value }: { value: string }) {
  const bars = value
    .split("")
    .map((c) => c.charCodeAt(0))
    .flatMap((code) => [
      1 + (code % 3),
      1 + ((code * 7) % 2),
      1 + ((code * 13) % 3),
    ]);

  return (
    <div className="flex items-end gap-px h-12 overflow-hidden">
      {bars.map((w, i) => (
        <div
          key={i}
          style={{ width: `${w * 2}px`, height: `${60 + ((i * 17) % 20)}%` }}
          className="bg-blue-900 rounded-sm shrink-0"
        />
      ))}
    </div>
  );
}