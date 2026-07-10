export function StateMessage({
  tone,
  title,
  text,
}: {
  tone: 'loading' | 'error' | 'empty';
  title: string;
  text: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-2 min-h-40 text-[#6b7386] text-sm" role={tone === 'error' ? 'alert' : 'status'}>
      <strong className="text-[#161a2c] font-space text-[17px] font-semibold">{title}</strong>
      <p>{text}</p>
    </div>
  );
}