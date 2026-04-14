import React, { useState } from 'react';
import { useVehicles, useAddVehicle, useUpdateVehicle, useDeleteVehicle } from '@/hooks/useVehicles';
import { useNavigate } from 'react-router-dom';
import { Vehicle, FuelType } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, Car } from 'lucide-react';

const COLORS = ['#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#10b981', '#f97316'];

function VehicleForm({ vehicle, onSave, onCancel }: { vehicle?: Vehicle; onSave: (data: any) => void; onCancel: () => void }) {
  const [make, setMake] = useState(vehicle?.make || '');
  const [model, setModel] = useState(vehicle?.model || '');
  const [year, setYear] = useState(vehicle?.year?.toString() || new Date().getFullYear().toString());
  const [nickname, setNickname] = useState(vehicle?.nickname || '');
  const [fuelType, setFuelType] = useState<FuelType>(vehicle?.fuel_type as FuelType || 'gasoline');
  const [color, setColor] = useState(vehicle?.color || COLORS[0]);

  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ make, model, year: parseInt(year), nickname: nickname || null, fuel_type: fuelType, color }); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Year</Label><Input type="number" value={year} onChange={e => setYear(e.target.value)} required /></div>
        <div className="space-y-2">
          <Label>Fuel Type</Label>
          <Select value={fuelType} onValueChange={v => setFuelType(v as FuelType)}>
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
      <div className="space-y-2"><Label>Make</Label><Input value={make} onChange={e => setMake(e.target.value)} required /></div>
      <div className="space-y-2"><Label>Model</Label><Input value={model} onChange={e => setModel(e.target.value)} required /></div>
      <div className="space-y-2"><Label>Nickname</Label><Input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="Optional" /></div>
      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">{vehicle ? 'Update' : 'Add Vehicle'}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export default function VehiclesPage() {
  const navigate = useNavigate();
  const { data: vehicles = [] } = useVehicles();
  const addVehicle = useAddVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}><ArrowLeft className="w-5 h-5" /></Button>
            <span className="font-semibold">Vehicles</span>
          </div>
          <Button size="sm" onClick={() => setShowAdd(true)} className="gap-1"><Plus className="w-4 h-4" /> Add</Button>
        </div>
      </header>
      <main className="container px-4 py-6 max-w-lg mx-auto space-y-4">
        {showAdd && (
          <Card className="glass-card">
            <CardContent className="p-4">
              <VehicleForm onSave={async (data) => { await addVehicle.mutateAsync(data); setShowAdd(false); }} onCancel={() => setShowAdd(false)} />
            </CardContent>
          </Card>
        )}
        {vehicles.map(v => (
          <Card key={v.id} className="glass-card">
            <CardContent className="p-4">
              {editingId === v.id ? (
                <VehicleForm vehicle={v} onSave={async (data) => { await updateVehicle.mutateAsync({ id: v.id, ...data }); setEditingId(null); }} onCancel={() => setEditingId(null)} />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: v.color + '20' }}>
                      <Car className="w-5 h-5" style={{ color: v.color }} />
                    </div>
                    <div>
                      <div className="font-medium">{v.nickname || `${v.year} ${v.make} ${v.model}`}</div>
                      <div className="text-xs text-muted-foreground">{v.year} {v.make} {v.model} · {v.fuel_type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(v.id)}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteVehicle.mutate(v.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
