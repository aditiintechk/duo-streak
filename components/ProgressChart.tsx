'use client';

interface ProgressChartProps {
  data: { day: string; you: number; partner: number }[];
  type?: 'bar' | 'line';
}

export default function ProgressChart({ data, type = 'bar' }: ProgressChartProps) {
  const maxValue = Math.max(...data.flatMap((d) => [d.you, d.partner]));

  return (
    <div className="space-y-1.5">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[var(--text-secondary)]">{item.day}</span>
            <span className="text-[var(--foreground)]">{item.you + item.partner} total</span>
          </div>
          <div className="flex gap-1.5">
            <div className="relative h-6 flex-1 overflow-hidden rounded bg-[var(--border)]">
              <div
                className="h-full bg-[var(--accent)] transition-all"
                style={{ width: `${(item.you / maxValue) * 100}%` }}
              />
              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-white">
                {item.you}
              </span>
            </div>
            <div className="relative h-6 flex-1 overflow-hidden rounded bg-[var(--border)]">
              <div
                className="h-full bg-[var(--partner-color)] transition-all"
                style={{ width: `${(item.partner / maxValue) * 100}%` }}
              />
              <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-white">
                {item.partner}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

