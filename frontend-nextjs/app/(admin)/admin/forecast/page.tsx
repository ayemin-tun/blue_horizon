'use client';

import { useEffect, useRef, useState } from 'react';
import { ENGINE_LOG_LINES, EngineTriggerPanel } from './components/EngineTriggerPanel';
import { ReportHeader } from './components/ReportHeader';
import { RouteDemandSection } from './components/RouteDemandSection';
import { AgentPerformanceSection } from './components/AgentPerformanceSection';
import { SeasonTrendsSection } from './components/SeasonTrendSection';
import { AirlineShareSection } from '@/app/(admin)/admin/forecast/components/AirlineShareSection';
type EngineState = 'idle' | 'running' | 'done';

export default function ForecastDashboardPage() {
  const [engineState, setEngineState] = useState<EngineState>('idle');
  const [visibleLines, setVisibleLines] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runEngine = () => {
    if (engineState === 'running') return;
    setEngineState('running');
    setVisibleLines(0);
  };

  useEffect(() => {
    if (engineState !== 'running') return;
    timerRef.current = setInterval(() => {
      setVisibleLines((prev) => {
        const next = prev + 1;
        if (next >= ENGINE_LOG_LINES.length) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => setEngineState('done'), 500);
        }
        return next;
      });
    }, 260);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [engineState]);

  return (
    <div>

      {engineState !== 'done' && (
        <EngineTriggerPanel onRun={runEngine} running={engineState === 'running'} visibleLines={visibleLines} />
      )}

      {engineState === 'done' && (
        <div className="max-w-272 mx-auto flex flex-col gap-6">
          <ReportHeader
            onRerun={() => {
              setEngineState('idle');
              setVisibleLines(0);
            }}
          />
          <RouteDemandSection />
          <AgentPerformanceSection />
          <SeasonTrendsSection />
          <AirlineShareSection />
        </div>
      )}
    </div>
  );
}