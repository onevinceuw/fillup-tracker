import React from 'react';
import { Fillup, Vehicle } from '@/types/database';
import { calculateEfficiency, getEfficiencyLabel } from '@/lib/calculations';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface Props {
  fillups: Fillup[];
  vehicle: Vehicle;
}

export default function EfficiencyChart({ fillups, vehicle }: Props) {
  const withEff = calculateEfficiency(fillups, vehicle);
  const sorted = [...withEff].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const label = getEfficiencyLabel(vehicle.fuel_type);

  const data = sorted.map((f) => ({
    date: new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    [label]: f.mpg,
  }));

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 15%, 55%)' }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(220, 22%, 14%)', border: '1px solid hsl(220, 15%, 22%)', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: 'hsl(210, 20%, 95%)' }}
            cursor={{ fill: 'hsl(220, 15%, 18%)', radius: 4 }}
          />
          <Bar dataKey={label} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
