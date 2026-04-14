import { Fillup, Vehicle } from '@/types/database';

export function calculateEfficiency(fillups: Fillup[], vehicle: Vehicle) {
  if (fillups.length < 2) return [];
  
  const sorted = [...fillups].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const results: (Fillup & { mpg: number | null; cost_per_mile: number | null })[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const prev = sorted[i - 1];
    const distance = current.odometer - prev.odometer;

    if (current.is_partial || distance <= 0) {
      results.push({ ...current, mpg: null, cost_per_mile: null });
      continue;
    }

    const isElectric = vehicle.fuel_type === 'electric';
    const efficiency = isElectric
      ? distance / current.quantity // mi/kWh
      : distance / current.quantity; // MPG
    const costPerMile = current.total_cost / distance;

    results.push({ ...current, mpg: Math.round(efficiency * 100) / 100, cost_per_mile: Math.round(costPerMile * 100) / 100 });
  }

  return results;
}

export function getEfficiencyLabel(fuelType: string) {
  return fuelType === 'electric' ? 'mi/kWh' : 'MPG';
}

export function getQuantityLabel(fuelType: string) {
  return fuelType === 'electric' ? 'kWh' : 'gal';
}

export function rollingAverage(data: { mpg: number | null }[], window: number) {
  return data.map((item, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1).filter(d => d.mpg !== null);
    if (slice.length === 0) return null;
    return slice.reduce((sum, d) => sum + d.mpg!, 0) / slice.length;
  });
}

export function getStats(fillups: Fillup[], vehicle: Vehicle) {
  const totalCost = fillups.reduce((s, f) => s + Number(f.total_cost), 0);
  const totalDistance = fillups.length >= 2
    ? Number(fillups[0].odometer) - Number(fillups[fillups.length - 1].odometer)
    : 0;
  const costPerMile = totalDistance > 0 ? Math.round((totalCost / totalDistance) * 100) / 100 : null;

  const withEfficiency = calculateEfficiency(fillups, vehicle);
  const validMpg = withEfficiency.filter(f => f.mpg !== null);
  
  if (validMpg.length === 0) {
    return { current: null, avg3mo: null, best: null, worst: null, totalCost: Math.round(totalCost * 100) / 100, costPerMile };
  }

  const current = validMpg[validMpg.length - 1].mpg;
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const recent = validMpg.filter(f => new Date(f.date) >= threeMonthsAgo);
  const avg3mo = recent.length > 0
    ? Math.round((recent.reduce((s, f) => s + f.mpg!, 0) / recent.length) * 100) / 100
    : null;
  const mpgValues = validMpg.map(f => f.mpg!);
  const best = Math.max(...mpgValues);
  const worst = Math.min(...mpgValues);

  return { current, avg3mo, best: Math.round(best * 100) / 100, worst: Math.round(worst * 100) / 100, totalCost: Math.round(totalCost * 100) / 100, costPerMile };
}
