/**
 * Local database mock that mimics the Supabase client API.
 * Stores all data in localStorage so it persists across page refreshes.
 * Swap between this and real Supabase via VITE_USE_LOCAL_DB env var.
 */

const STORAGE_PREFIX = 'fillup_db_';

function getTable(name: string): any[] {
  const raw = localStorage.getItem(STORAGE_PREFIX + name);
  return raw ? JSON.parse(raw) : [];
}

function setTable(name: string, data: any[]) {
  localStorage.setItem(STORAGE_PREFIX + name, JSON.stringify(data));
}

// Make sure table keys exist
['profiles', 'vehicles', 'fillups'].forEach(table => {
  if (!localStorage.getItem(STORAGE_PREFIX + table)) {
    setTable(table, []);
  }
});

class QueryBuilder {
  private tableName: string;
  private operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private selectColumns = '*';
  private filters: Array<{ type: string; column: string; op?: string; value: any }> = [];
  private orderByCol: { column: string; ascending: boolean } | null = null;
  private limitCount: number | null = null;
  private insertData: any = null;
  private updateData: any = null;
  private isSingle = false;
  private shouldReturnData = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns = '*') {
    this.selectColumns = columns;
    this.shouldReturnData = true;
    // Only switch to select mode if no write operation was set first
    if (!this.insertData && !this.updateData && this.operation !== 'delete') {
      this.operation = 'select';
    }
    return this;
  }

  insert(data: any) {
    this.operation = 'insert';
    this.insertData = data;
    return this;
  }

  update(data: any) {
    this.operation = 'update';
    this.updateData = data;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  not(column: string, op: string, value: any) {
    this.filters.push({ type: 'not', column, op, value });
    return this;
  }

  order(column: string, options: { ascending: boolean } = { ascending: true }) {
    this.orderByCol = { column, ascending: options.ascending };
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  private applyFilters(rows: any[]): any[] {
    return rows.filter(row =>
      this.filters.every(f => {
        if (f.type === 'eq') return row[f.column] === f.value;
        if (f.type === 'not' && f.op === 'is' && f.value === null) {
          return row[f.column] != null;
        }
        return true;
      })
    );
  }

  private execute(): { data: any; error: any } {
    try {
      let rows = getTable(this.tableName);

      switch (this.operation) {
        case 'select': {
          rows = this.applyFilters(rows);

          // Handle joins like 'select("*, vehicles(*)")'
          if (this.selectColumns.includes('vehicles(*)')) {
            const vehicles = getTable('vehicles');
            rows = rows.map(row => ({
              ...row,
              vehicles: vehicles.find((v: any) => v.id === row.vehicle_id) || null,
            }));
          }

          // Handle partial column selects (e.g. 'display_name')
          if (this.selectColumns !== '*' && !this.selectColumns.includes('(')) {
            const cols = this.selectColumns.split(',').map(c => c.trim());
            rows = rows.map(row => {
              const out: any = {};
              cols.forEach(col => {
                out[col] = row[col];
              });
              return out;
            });
          }

          if (this.orderByCol) {
            const { column, ascending } = this.orderByCol;
            rows.sort((a: any, b: any) => {
              if (a[column] < b[column]) return ascending ? -1 : 1;
              if (a[column] > b[column]) return ascending ? 1 : -1;
              return 0;
            });
          }

          if (this.limitCount != null) rows = rows.slice(0, this.limitCount);

          return { data: this.isSingle ? (rows[0] ?? null) : rows, error: null };
        }

        case 'insert': {
          const newRow = {
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            ...this.insertData,
          };
          rows.push(newRow);
          setTable(this.tableName, rows);

          if (this.shouldReturnData) {
            return { data: this.isSingle ? newRow : [newRow], error: null };
          }
          return { data: null, error: null };
        }

        case 'update': {
          const matched = this.applyFilters(rows);
          const ids = new Set(matched.map((r: any) => r.id));
          rows = rows.map((row: any) => (ids.has(row.id) ? { ...row, ...this.updateData } : row));
          setTable(this.tableName, rows);
          return { data: null, error: null };
        }

        case 'delete': {
          const toDelete = this.applyFilters(rows);
          const deleteIds = new Set(toDelete.map((r: any) => r.id));
          rows = rows.filter((row: any) => !deleteIds.has(row.id));
          setTable(this.tableName, rows);
          return { data: null, error: null };
        }
      }

      return { data: null, error: null };
    } catch (e: any) {
      return { data: null, error: { message: e.message } };
    }
  }

  // Makes the builder "thenable" so `await supabase.from(...).select(...)` works
  then(resolve: (value: any) => void, reject?: (error: any) => void) {
    try {
      resolve(this.execute());
    } catch (e) {
      if (reject) reject(e);
    }
  }
}

export const localDb = {
  from(table: string) {
    return new QueryBuilder(table);
  },
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: async () => ({ data: { session: null } }),
    signUp: async () => ({ error: null }),
    signInWithPassword: async () => ({ error: null }),
    signOut: async () => {},
  },
};
