import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { useAddFillup, useUpdateFillup, useFillups } from '@/hooks/useFillups';
import { useVehicles } from '@/hooks/useVehicles';
import { getQuantityLabel } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [chargeBefore, setChargeBefore] = useState('');
  const [chargeAfter, setChargeAfter] = useState('');

  useEffect(() => {
    if (existingFillup) {
      setDate(existingFillup.date);
      setOdometer(existingFillup.odometer.toString());
      setQuantity(existingFillup.quantity.toString());
      setPricePerUnit(existingFillup.price_per_unit.toString());
      setTotalCost(existingFillup.total_cost.toString());
      setIsPartial(existingFillup.is_partial);
      setStation(existingFillup.station || '');
      setNotes(existingFillup.notes || '');
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
    const data = {
      vehicle_id: vehicleId,
      date,
      odometer: parseFloat(odometer),
      quantity: parseFloat(quantity),
      price_per_unit: parseFloat(pricePerUnit),
      total_cost: parseFloat(totalCost),
      is_partial: isPartial,
      station: station || null,
      notes: notes || null,
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
              <Input type="number" value={odometer} onChange={e => setOdometer(e.target.value)} required placeholder="45230" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isElectric ? 'kWh Added' : 'Gallons'}</Label>
              <Input type="number" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} required placeholder={isElectric ? '35.5' : '12.5'} />
            </div>
            <div className="space-y-2">
              <Label>Price/{qtyLabel}</Label>
              <Input type="number" step="0.001" value={pricePerUnit} onChange={e => setPricePerUnit(e.target.value)} required placeholder={isElectric ? '0.12' : '3.459'} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Total Cost</Label>
            <Input type="number" step="0.01" value={totalCost} onChange={e => setTotalCost(e.target.value)} required />
          </div>
          {isElectric && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Charge Before (%)</Label>
                <Input type="number" min={0} max={100} value={chargeBefore} onChange={e => setChargeBefore(e.target.value)} placeholder="20" />
              </div>
              <div className="space-y-2">
                <Label>Charge After (%)</Label>
                <Input type="number" min={0} max={100} value={chargeAfter} onChange={e => setChargeAfter(e.target.value)} placeholder="80" />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>Station (optional)</Label>
            <Input value={station} onChange={e => setStation(e.target.value)} placeholder="Shell on Main St" />
          </div>
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Highway trip, AC running..." rows={2} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <Label className="text-sm">Partial fill-up</Label>
            <Switch checked={isPartial} onCheckedChange={setIsPartial} />
          </div>
          <Button type="submit" className="w-full" disabled={addFillup.isPending || updateFillup.isPending}>
            {existingFillup ? 'Update Fill-up' : 'Save Fill-up'}
          </Button>
        </form>
      </main>
    </div>
  );
}
