import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardList, User, Search, Clock, FileText, Edit, Trash2, Eye, LogIn, LogOut } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useState, useMemo } from 'react';

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  user_id: string | null;
  details: any;
  ip_address: string | null;
  created_at: string;
}

export function AuditLogs() {
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return data as AuditLog[];
    }
  });

  const filteredLogs = useMemo(() => {
    if (!logs) return [];

    return logs.filter(log => {
      if (entityFilter !== 'all' && log.entity_type !== entityFilter) return false;
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;
      if (search) {
        const searchLower = search.toLowerCase();
        return (
          log.action.toLowerCase().includes(searchLower) ||
          log.entity_type.toLowerCase().includes(searchLower) ||
          (log.entity_id && log.entity_id.toLowerCase().includes(searchLower)) ||
          JSON.stringify(log.details).toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [logs, search, entityFilter, actionFilter]);

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'insert':
        return <FileText className="h-4 w-4 text-green-500" />;
      case 'update':
      case 'edit':
        return <Edit className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'view':
      case 'read':
        return <Eye className="h-4 w-4 text-gray-500" />;
      case 'login':
        return <LogIn className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <LogOut className="h-4 w-4 text-orange-500" />;
      default:
        return <ClipboardList className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionBadge = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'insert':
        return <Badge className="bg-green-500">Create</Badge>;
      case 'update':
      case 'edit':
        return <Badge className="bg-blue-500">Update</Badge>;
      case 'delete':
        return <Badge variant="destructive">Delete</Badge>;
      case 'view':
      case 'read':
        return <Badge variant="secondary">View</Badge>;
      case 'login':
        return <Badge className="bg-green-600">Login</Badge>;
      case 'logout':
        return <Badge className="bg-orange-500">Logout</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const uniqueEntities = useMemo(() => {
    if (!logs) return [];
    return [...new Set(logs.map(l => l.entity_type))];
  }, [logs]);

  const uniqueActions = useMemo(() => {
    if (!logs) return [];
    return [...new Set(logs.map(l => l.action))];
  }, [logs]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">Track all data access and modifications for compliance</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Entity Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {uniqueEntities.map(entity => (
              <SelectItem key={entity} value={entity}>{entity}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map(action => (
              <SelectItem key={action} value={action}>{action}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="card-elevated">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2.5 text-lg font-semibold">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ClipboardList className="h-4.5 w-4.5 text-primary" />
            </div>
            Activity Log
            {filteredLogs.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {filteredLogs.length} entries
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : filteredLogs.length > 0 ? (
              <div className="space-y-2">
                {filteredLogs.map((log, index) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors animate-slide-up"
                    style={{ animationDelay: `${Math.min(index, 10) * 20}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center mt-0.5">
                          {getActionIcon(log.action)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {getActionBadge(log.action)}
                            <Badge variant="outline" className="font-normal">
                              {log.entity_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {log.entity_id ? `ID: ${log.entity_id.slice(0, 8)}...` : 'No entity ID'}
                          </p>
                          {log.details && (
                            <p className="text-xs text-muted-foreground mt-1 max-w-md truncate">
                              {JSON.stringify(log.details).slice(0, 100)}...
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {format(parseISO(log.created_at), 'MMM d, HH:mm')}
                        </div>
                        {log.user_id && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <User className="h-3 w-3" />
                            {log.user_id.slice(0, 8)}...
                          </div>
                        )}
                        {log.ip_address && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            IP: {log.ip_address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <ClipboardList className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No audit logs found</h3>
                <p className="text-muted-foreground mt-1">
                  {search || entityFilter !== 'all' || actionFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Activity logs will appear here'}
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
