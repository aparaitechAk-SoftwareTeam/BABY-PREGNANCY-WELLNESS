import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/tables/DataTableCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { mockAuditLogs } from '@/mocks/admin.mock';
import { Search, ScrollText, Download } from 'lucide-react';
import { formatDateTime } from '@/utils/format';

export function AuditLogs() {
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['auditLogs', search, resultFilter, dateFilter],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      let filtered = [...mockAuditLogs];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((l) =>
          l.adminUser.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.targetRecord.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q)
        );
      }
      if (resultFilter !== 'all') filtered = filtered.filter((l) => l.result === resultFilter);
      if (dateFilter !== 'all') {
        const now = new Date();
        const days = dateFilter === 'today' ? 1 : dateFilter === 'week' ? 7 : 30;
        filtered = filtered.filter((l) => {
          const logDate = new Date(l.timestamp);
          const diff = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
          return diff <= days;
        });
      }
      return filtered;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Audit Logs</h2>
          <p className="text-sm text-muted-foreground">Track all administrative actions and system changes</p>
        </div>
        <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export Logs</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by user, action, or target..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={resultFilter} onValueChange={setResultFilter}>
              <SelectTrigger><SelectValue placeholder="Result" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger><SelectValue placeholder="Date Range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Last 24 Hours</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Admin User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="hidden md:table-cell">Target</TableHead>
                <TableHead className="hidden lg:table-cell">Timestamp</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="hidden lg:table-cell">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6} className="pl-4"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ))
              ) : logs && logs.length > 0 ? logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="pl-4 font-medium text-navy">{log.adminUser}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.action}</TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">{log.targetRecord}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDateTime(log.timestamp)}</TableCell>
                  <TableCell><StatusBadge status={log.result} /></TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-xs truncate">{log.details}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground"><ScrollText className="h-8 w-8" /><p>No audit logs found.</p></div>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
