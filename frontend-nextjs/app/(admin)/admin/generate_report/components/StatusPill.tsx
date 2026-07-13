'use client';

export default function StatusPill({ value }: { value: string }) {
  const positive = ['CONFIRMED', 'HIGH', 'TOP', 'PEAK', 'DOMINANT'];
  const negative = ['CANCELLED', 'LOW', 'MINOR'];
  const tone = positive.includes(value) ? 'good' : negative.includes(value) ? 'bad' : 'mid';
  return (
    <span className={`pill pill-${tone}`}>
      {value}
      <style jsx>{`
        .pill {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.15rem 0.55rem;
          border-radius: 0.3rem;
        }
        .pill-good {
          color: #1c7a4a;
          background: #e6f6ec;
        }
        .pill-bad {
          color: #c0392b;
          background: #fbe9e7;
        }
        .pill-mid {
          color: #8a6d1f;
          background: #fbf1dc;
        }
      `}</style>
    </span>
  );
}