import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/services/notifications.api';
import { NOTIFICATION_AUDIENCES } from '@/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/tables/DataTableCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Bell, CheckCircle2, Send, Eye } from 'lucide-react';
import { formatNumber, formatDateTime } from '@/utils/format';

export function NotificationList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', message: '', audience: 'all_users' as string, scheduledAt: '' });

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page, pageSize, debouncedSearch, statusFilter],
    queryFn: () => notificationsApi.fetchNotifications(page, pageSize, debouncedSearch, statusFilter),
  });

  const handleCreate = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Title and message are required.' });
      return;
    }
    try {
      await notificationsApi.createNotification({
        ...form,
        audience: form.audience as any,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : new Date().toISOString(),
      });
      toast({ title: 'Notification Created', description: 'Campaign has been created as a draft.' });
      setCreateOpen(false);
      setForm({ title: '', message: '', audience: 'all_users', scheduledAt: '' });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create notification.' });
    }
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await notificationsApi.approveNotification(id);
      toast({ title: result.success ? 'Notification Approved' : 'Action Failed', description: result.message });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } finally { setActionLoading(null); }
  };

  const handleSend = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await notificationsApi.sendNotification(id);
      toast({ title: result.success ? 'Notification Sent' : 'Action Failed', description: result.message });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } finally { setActionLoading(null); }
  };

  const audienceLabel = (aud: string) => NOTIFICATION_AUDIENCES.find((a) => a.value === aud)?.label || aud;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Notification Management</h2>
          <p className="text-sm text-muted-foreground">Create and manage informational, non-diagnostic notification campaigns</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />New Campaign</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
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
                <TableHead className="pl-4">Title</TableHead>
                <TableHead className="hidden md:table-cell">Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Scheduled</TableHead>
                <TableHead className="hidden lg:table-cell">Delivery</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6} className="pl-4"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ))
              ) : data && data.data.length > 0 ? data.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="pl-4 max-w-xs">
                    <p className="font-medium text-navy truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{item.message}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{audienceLabel(item.audience)}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDateTime(item.scheduledAt)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {item.deliveryCount ? `${formatNumber(item.deliveryCount)} sent` : '—'}
                    {item.openRate ? ` (${item.openRate}% open)` : ''}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewItem(item)} title="View"><Eye className="h-4 w-4" /></Button>
                      {item.status === 'pending_approval' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-sage hover:text-sage" onClick={() => handleApprove(item.id)} disabled={actionLoading === item.id} title="Approve"><CheckCircle2 className="h-4 w-4" /></Button>
                      )}
                      {item.status === 'approved' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary" onClick={() => handleSend(item.id)} disabled={actionLoading === item.id} title="Send Now"><Send className="h-4 w-4" /></Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground"><Bell className="h-8 w-8" /><p>No notification campaigns found.</p></div>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Notification Campaign</DialogTitle>
            <DialogDescription>Create an informational, non-diagnostic notification campaign</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Campaign title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea placeholder="Notification message (informational, non-alarming)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <Label>Audience</Label>
              <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_AUDIENCES.map((a) => (<SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Schedule (optional)</Label>
              <Input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
              <p className="text-xs text-blue-800">Notifications must be informational and non-diagnostic. Avoid alarming language or medical directives. All campaigns require approval before sending.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Draft</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewItem?.title}</DialogTitle>
            <DialogDescription>{previewItem && audienceLabel(previewItem.audience)} - {previewItem && formatDateTime(previewItem.scheduledAt)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm leading-relaxed text-foreground">{previewItem?.message}</p>
            {previewItem?.deliveryCount && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Delivered</p>
                  <p className="text-lg font-semibold text-navy">{formatNumber(previewItem.deliveryCount)}</p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Open Rate</p>
                  <p className="text-lg font-semibold text-navy">{previewItem.openRate}%</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
