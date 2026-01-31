'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface TelemetryChartsProps {
  data: Array<{ time: number; altitude: number; velocity: number }>;
}

export function TelemetryCharts({ data }: TelemetryChartsProps) {
  const chartData = data.map((d) => ({
    time: d.time.toFixed(1),
    altitude: d.altitude,
    velocity: d.velocity,
  }));

  if (chartData.length < 2) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
        Run simulation for charts.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend />
            <Line type="monotone" dataKey="altitude" stroke="#22c55e" dot={false} name="Altitude (m)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 10 }} />
            <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend />
            <Line type="monotone" dataKey="velocity" stroke="#3b82f6" dot={false} name="Velocity (m/s)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
