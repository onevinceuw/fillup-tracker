import React, { useState } from 'react';
import { useVehicles } from '@/hooks/useVehicles';
import { useFillups } from '@/hooks/useFillups';
import { getStats, getEfficiencyLabel } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel, TrendingUp, TrendingDown, Plus, Car, ChevronDown, Gauge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import FillupList from '@/components/FillupList';
import EfficiencyChart from '@/components/EfficiencyChart';

export default function DashboardPage() {
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const navigate = useNavigate();

  const activeVehicle = selectedVehicleId
    ? vehicles.find(v => v.id === selectedVehicleId)
    : vehicles[0];

  const { data: fillups = [] } = useFillups(activeVehicle?.id);

  React.useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  if (vehiclesLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-muted-foreground">Loading...</div></div>;
  }

  if (vehicles.length === 0) {
    navigate('/onboarding');
    return null;
  }

  const stats = activeVehicle ? getStats(fillups, activeVehicle) : null;
  const effLabel = activeVehicle ? getEfficiencyLabel(activeVehicle.fuel_type) : 'MPG';

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <Fuel className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg">Fillup</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: activeVehicle?.color }} />
                <span className="max-w-[120px] truncate">{activeVehicle?.nickname || `${activeVehicle?.year} ${activeVehicle?.make}`}</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {vehicles.map(v => (
                <DropdownMenuItem key={v.id} onClick={() => setSelectedVehicleId(v.id)} className="gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: v.color }} />
                  {v.nickname || `${v.year} ${v.make} ${v.model}`}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={() => navigate('/vehicles')} className="gap-2">
                <Car className="w-3 h-3" /> Manage Vehicles
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="stat-label">Current {effLabel}</div>
              <div className="stat-value text-primary">{stats?.current ?? '—'}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="stat-label">3-Month Avg</div>
              <div className="stat-value">{stats?.avg3mo ?? '—'}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-1 stat-label"><TrendingUp className="w-3 h-3 text-success" /> Best</div>
              <div className="stat-value text-success">{stats?.best ?? '—'}</div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-1 stat-label"><TrendingDown className="w-3 h-3 text-destructive" /> Worst</div>
              <div className="stat-value text-destructive">{stats?.worst ?? '—'}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <div className="stat-label">Total Spent</div>
              <div className="stat-value">${stats?.totalCost?.toFixed(2) ?? '0.00'}</div>
            </div>
            <div className="text-right">
              <div className="stat-label">Cost/Mile</div>
              <div className="stat-value">{stats?.costPerMile ? `$${stats.costPerMile}` : '—'}</div>
            </div>
          </CardContent>
        </Card>

        {activeVehicle && fillups.length >= 2 && (
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Efficiency Over Time</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <EfficiencyChart fillups={fillups} vehicle={activeVehicle} />
            </CardContent>
          </Card>
        )}

        <Button onClick={() => navigate(`/fillup/new?vehicle=${activeVehicle?.id}`)} className="w-full gap-2" size="lg">
          <Plus className="w-4 h-4" /> Log Fill-up
        </Button>

        {fillups.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Fill-ups</h3>
            <FillupList fillups={fillups} vehicle={activeVehicle!} />
          </div>
        ) : (
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <Gauge className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No fill-ups yet. Log your first one to start tracking efficiency!</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
