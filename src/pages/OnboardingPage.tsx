import React, { useState } from 'react';
import { useAddVehicle } from '@/hooks/useVehicles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FuelType } from '@/types/database';

const VEHICLE_COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#10b981', '#f97316', '#000000', '#ffffff'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const addVehicle = useAddVehicle();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [nickname, setNickname] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('gasoline');
  const [color, setColor] = useState(VEHICLE_COLORS[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addVehicle.mutateAsync({ make, model, year: parseInt(year), nickname: nickname || null, fuel_type: fuelType, color });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Car className="w-7 h-7 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Add Your First Vehicle</CardTitle>
            <CardDescription>Let's get you set up to start tracking</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <div className="flex items-center h-10 w-full rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden">
                  <button type="button" onClick={() => setYear(String(Math.max(1900, parseInt(year || '0') - 1)))} className="shrink-0 px-2 h-full flex items-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <input type="text" inputMode="numeric" className="flex-1 min-w-0 text-center text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground" value={year} onChange={e => setYear(e.target.value.replace(/\D/g, '').slice(0, 4))} required />
                  <button type="button" onClick={() => setYear(String(Math.min(2099, parseInt(year || '0') + 1)))} className="shrink-0 px-2 h-full flex items-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Fuel Type</Label>
                <Select value={fuelType} onValueChange={(v) => setFuelType(v as FuelType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasoline">Gasoline</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Make</Label>
              <Input value={make} onChange={e => setMake(e.target.value)} required placeholder="Toyota" />
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Input value={model} onChange={e => setModel(e.target.value)} required placeholder="Camry" />
            </div>
            <div className="space-y-2">
              <Label>Nickname (optional)</Label>
              <Input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="My daily driver" />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {VEHICLE_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={addVehicle.isPending}>
              {addVehicle.isPending ? 'Adding...' : 'Add Vehicle & Continue'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
