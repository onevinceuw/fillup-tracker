import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fuel, Plus, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

export default function UserSelectPage() {
  const { setCurrentUser } = useUser();
  const [newName, setNewName] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const { data: users = [], refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .not('display_name', 'is', null)
        .order('display_name');
      if (error) throw error;
      return data.map(u => u.display_name as string);
    },
  });

  const handleAddUser = async () => {
    if (!newName.trim()) return;
    const name = newName.trim();
    await supabase.from('profiles').insert({ display_name: name } as any);
    await refetch();
    setCurrentUser(name);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Fuel className="w-7 h-7 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Fillup</CardTitle>
            <CardDescription>Who's logging today?</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.map(name => (
            <button
              key={name}
              onClick={() => setCurrentUser(name)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium">{name}</span>
            </button>
          ))}

          {showAdd ? (
            <form onSubmit={e => { e.preventDefault(); handleAddUser(); }} className="flex gap-2">
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Your name"
                autoFocus
              />
              <Button type="submit" size="sm">Add</Button>
            </form>
          ) : (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-border hover:bg-muted/30 transition-colors text-muted-foreground"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add new person</span>
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
