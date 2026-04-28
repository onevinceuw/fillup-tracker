import React from 'react';
import { Fillup, Vehicle } from '@/types/database';
import { getQuantityLabel, getEfficiencyLabel, calculateEfficiency } from '@/lib/calculations';
import { useNavigate } from 'react-router-dom';
import { useDeleteFillup } from '@/hooks/useFillups';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, MapPin } from 'lucide-react';

interface Props {
  fillups: Fillup[];
  vehicle: Vehicle;
}

export default function FillupList({ fillups, vehicle }: Props) {
  const navigate = useNavigate();
  const deleteFillup = useDeleteFillup();
  const qtyLabel = getQuantityLabel(vehicle.fuel_type);
  const effLabel = getEfficiencyLabel(vehicle.fuel_type);

  // Build a map of fillup id -> mpg
  const withEff = calculateEfficiency(fillups, vehicle);
  const mpgMap = new Map(withEff.map(f => [f.id, f.mpg]));

  return (
    <div className="space-y-2">
      {fillups.map(f => {
        const mpg = mpgMap.get(f.id);
        return (
        <Card key={f.id} className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{new Date(f.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {f.is_partial && <span className="text-[10px] bg-warning/20 text-warning px-1.5 py-0.5 rounded-full font-medium">PARTIAL</span>}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{f.quantity} {qtyLabel}</span>
                  <span>${f.total_cost.toFixed(2)}</span>
                  <span>{f.odometer.toLocaleString()} mi</span>
                </div>
                {f.station && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" /> {f.station}
                  </div>
                )}
              </div>
              {mpg != null && (
                <div className="text-right mr-2">
                  <span className="text-lg font-bold text-primary">{mpg}</span>
                  <span className="text-[10px] text-muted-foreground block">{effLabel}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/fillup/${f.id}?vehicle=${vehicle.id}`)}>
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteFillup.mutate(f.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
}
