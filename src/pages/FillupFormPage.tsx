import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useAddFillup, useUpdateFillup, useFillups } from '@/hooks/useFillups';
import { useVehicles } from '@/hooks/useVehicles';
import { getQuantityLabel } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft } from 'lucide-react';

export default function FillupFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const vehicleId = searchParams.get('vehicle') || '';
  const { data: vehicles = [] } = useVehicles();
  const vehicle = vehicles.find(v => v.id === vehicleId);
  const { data: fillups = [] } = useFillups(vehicleId);
  const existingFillup = id && id !== 'new' ? fillups.find(f => f.id === id) : null;

  const addFillup = useAddFillup();
  const updateFillup = useUpdateFillup();
  const isElectric = vehicle?.fuel_type === 'electric';
  const qtyLabel = vehicle ? getQuantityLabel(vehicle.fuel_type) : 'gal';

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [isPartial, setIsPartial] = useState(false);
  const [station, setStation] = useState('');
  const [notes, setNotes] = useState('');
  const [drivingStyle, setDrivingStyle] = useState<string | null>(null);
  const [roadMix, setRoadMix] = useState([50]);
  const [chargeBefore, setChargeBefore] = useState('');
  const [chargeAfter, setChargeAfter] = useState('');
  const [stationOpen, setStationOpen] = useState(false);
  const stationRef = useRef<HTMLDivElement>(null);

  // Collect unique station names from past fill-ups for the dropdown
  const pastStations = useMemo(() => {
    const names = fillups
      .map(f => f.station)
      .filter((s): s is string => !!s);
    return [...new Set(names)].sort();
  }, [fillups]);

  // Filter stations based on current input
  const filteredStations = useMemo(() => {
    if (!station) return pastStations;
    return pastStations.filter(s => s.toLowerCase().includes(station.toLowerCase()));
  }, [pastStations, station]);

  // Most recent fillup for this vehicle (fillups are sorted date desc)
  const lastFillup = !existingFillup && fillups.length > 0 ? fillups[0] : null;

  useEffect(() => {
    if (existingFillup) {
      setDate(existingFillup.date);
      setOdometer(existingFillup.odometer.toString());
      setQuantity(existingFillup.quantity.toString());
      setPricePerUnit(existingFillup.price_per_unit.toString());
      setTotalCost(existingFillup.total_cost.toString());
      setIsPartial(existingFillup.is_partial);
      setStation(existingFillup.station || '');
      // Parse notes back into driving style and road mix
      const n = existingFillup.notes || '';
      const styleMatch = n.match(/Driving: (\w+)/);
      const mixMatch = n.match(/Road: (\d+)% City/);
      if (styleMatch) setDrivingStyle(styleMatch[1]);
      if (mixMatch) setRoadMix([parseInt(mixMatch[1])]);
      setNotes(n);
      setChargeBefore(existingFillup.charge_level_before?.toString() || '');
      setChargeAfter(existingFillup.charge_level_after?.toString() || '');
    }
  }, [existingFillup]);

  useEffect(() => {
    const q = parseFloat(quantity);
    const p = parseFloat(pricePerUnit);
    if (!isNaN(q) && !isNaN(p)) {
      setTotalCost((q * p).toFixed(2));
    }
  }, [quantity, pricePerUnit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Build notes from driving style + road mix selections
    const parts: string[] = [];
    if (drivingStyle) parts.push(`Driving: ${drivingStyle}`);
    parts.push(`Road: ${roadMix[0]}% City / ${100 - roadMix[0]}% Highway`);
    const builtNotes = parts.join(' | ') || null;

    const data = {
      vehicle_id: vehicleId,
      date,
      odometer: parseFloat(odometer),
      quantity: parseFloat(quantity),
      price_per_unit: parseFloat(pricePerUnit),
      total_cost: parseFloat(totalCost),
      is_partial: isPartial,
      station: station || null,
      notes: builtNotes,
      charge_level_before: chargeBefore ? parseFloat(chargeBefore) : null,
      charge_level_after: chargeAfter ? parseFloat(chargeAfter) : null,
    };
    if (existingFillup) {
      await updateFillup.mutateAsync({ id: existingFillup.id, ...data });
    } else {
      await addFillup.mutateAsync(data);
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center h-14 px-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="font-semibold">{existingFillup ? 'Edit Fill-up' : 'Log Fill-up'}</span>
        </div>
      </header>
      <main className="container px-4 py-6 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Odometer (mi)</Label>
              <Input type="text" inputMode="decimal" value={odometer} onChange={e => setOdometer(e.target.value)} required placeholder={lastFillup ? lastFillup.odometer.toLocaleString() : '45230'} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isElectric ? 'kWh Added' : 'Gallons'}</Label>
              <Input type="text" inputMode="decimal" value={quantity} onChange={e => setQuantity(e.target.value)} required placeholder={lastFillup ? String(lastFillup.quantity) : (isElectric ? '35.5' : '12.5')} />
            </div>
            <div className="space-y-2">
              <Label>Price/{qtyLabel}</Label>
              <Input type="text" inputMode="decimal" value={pricePerUnit} onChange={e => setPricePerUnit(e.target.value)} required placeholder={lastFillup ? String(lastFillup.price_per_unit) : (isElectric ? '0.12' : '3.459')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Total Cost</Label>
            <Input type="text" inputMode="decimal" value={totalCost} onChange={e => setTotalCost(e.target.value)} required />
          </div>
          {isElectric && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Charge Before (%)</Label>
                <Input type="text" inputMode="decimal" value={chargeBefore} onChange={e => setChargeBefore(e.target.value)} placeholder="20" />
              </div>
              <div className="space-y-2">
                <Label>Charge After (%)</Label>
                <Input type="text" inputMode="decimal" value={chargeAfter} onChange={e => setChargeAfter(e.target.value)} placeholder="80" />
              </div>
            </div>
          )}
          <div className="space-y-2 relative" ref={stationRef}>
            <Label>Station (optional)</Label>
            <Input
              value={station}
              onChange={e => { setStation(e.target.value); setStationOpen(true); }}
              onFocus={() => setStationOpen(true)}
              onBlur={() => setTimeout(() => setStationOpen(false), 150)}
              placeholder={lastFillup?.station || 'Shell on Main St'}
            />
            {stationOpen && filteredStations.length > 0 && (
              <div className="absolute z-50 w-full mt-1 rounded-md border border-border bg-popover shadow-md animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150">
                {filteredStations.map(s => (
                  <button
                    key={s}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors first:rounded-t-md last:rounded-b-md"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { setStation(s); setStationOpen(false); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Driving Style</Label>
              <div className="flex gap-2">
                {([
                  { label: 'Aggressive', active: 'bg-red-500 text-white', inactive: 'bg-red-500/10 text-red-300/50' },
                  { label: 'Normal', active: 'bg-yellow-500 text-white', inactive: 'bg-yellow-500/10 text-yellow-300/50' },
                  { label: 'Chill', active: 'bg-sky-400 text-white', inactive: 'bg-sky-400/10 text-sky-300/50' },
                ] as const).map(({ label, active, inactive }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setDrivingStyle(drivingStyle === label ? null : label)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      drivingStyle === label ? active : inactive
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Road Mix</Label>
              <Slider
                value={roadMix}
                onValueChange={setRoadMix}
                min={0}
                max={100}
                step={25}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>All City</span>
                <span>Mostly City</span>
                <span>Mixed</span>
                <span>Mostly Hwy</span>
                <span>All Hwy</span>
              </div>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={addFillup.isPending || updateFillup.isPending}>
            {existingFillup ? 'Update Fill-up' : 'Save Fill-up'}
          </Button>
        </form>
      </main>
    </div>
  );
}
