import React from 'react';
import { Fillup, Vehicle } from '@/types/database';
import { calculateEfficiency, rollingAverage, getEfficiencyLabel } from '@/lib/calculations';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  fillups: Fillup[];
  vehicle: Vehicle;
}

export default function EfficiencyChart({ fillups, vehicle }: Props) {
  const withEff = calculateEfficiency(fillups, vehicle);
  const sorted = [...withEff].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const rolling = rollingAverage(sorted, 5);
  const label = getEfficiencyLabel(vehicle.fuel_type);

  const data = sorted.map((f, i) => ({
    date: new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    [label]: f.mpg,
    avg: rolling[i] ? Math.round(rolling[i]! * 100) / 100 : null,
  }));

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(220, 22%, 14%)', border: '1px solid hsl(220, 15%, 22%)', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: 'hsl(210, 20%, 95%)' }}
          />
          <Line type="monotone" dataKey={label} stroke={vehicle.color} strokeWidth={2} dot={{ r: 3, fill: vehicle.color }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="avg" stroke="hsl(215, 15%, 55%)" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
