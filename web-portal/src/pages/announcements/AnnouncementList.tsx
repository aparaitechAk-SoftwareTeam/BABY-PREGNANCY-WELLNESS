import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { mockAnnouncements } from '@/mocks/content.mock';
import type { Announcement } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/tables/DataTableCard';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, Megaphone, Trash2 } from 'lucide-react';
import { formatDateTime, formatDate } from '@/utils/format';

let announcementStore = [...mockAnnouncements];

export function AnnouncementList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);
  const [previewItem, setPreviewItem] = useState<Announcement | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', body: '', publishDate: '' });

  const { data: announcements } = useQuery({
    queryKey: ['announcements', search, statusFilter],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      let filtered = [...announcementStore];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((a) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q));
      }
      if (statusFilter !== 'all') filtered = filtered.filter((a) => a.status === statusFilter);
      return filtered;
    },
  });

  const openNew = () => {
    setEditingItem(null);
    setForm({ title: '', body: '', publishDate: new Date().toISOString().split('T')[0] });
    setEditOpen(true);
  };

  const openEdit = (item: Announcement) => {
    setEditingItem(item);
    setForm({ title: item.title, body: item.body, publishDate: item.publishDate.split('T')[0] });
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Title and body are required.' });
      return;
    }
    const publishISO = new Date(form.publishDate).toISOString();
    if (editingItem) {
      const idx = announcementStore.findIndex((a) => a.id === editingItem.id);
      if (idx !== -1) {
        announcementStore[idx] = { ...announcementStore[idx], ...form, publishDate: publishISO, updatedAt: new Date().toISOString() };
      }
      toast({ title: 'Announcement Updated', description: 'The announcement has been updated.' });
    } else {
      announcementStore.unshift({
        id: `a-${String(announcementStore.length + 1).padStart(3, '0')}`,
        ...form,
        publishDate: publishISO,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast({ title: 'Announcement Created', description: 'The announcement has been created as a draft.' });
    }
    setEditOpen(false);
    queryClient.invalidateQueries({ queryKey: ['announcements'] });
  };

  const togglePublish = (item: Announcement) => {
    const idx = announcementStore.findIndex((a) => a.id === item.id);
    if (idx !== -1) {
      announcementStore[idx] = { ...announcementStore[idx], status: announcementStore[idx].status === 'published' ? 'draft' : 'published', updatedAt: new Date().toISOString() };
      toast({ title: announcementStore[idx].status === 'published' ? 'Announcement Published' : 'Announcement Unpublished', description: announcementStore[idx].title });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    announcementStore = announcementStore.filter((a) => a.id !== deleteId);
    toast({ title: 'Announcement Deleted', description: 'The announcement has been removed.' });
    setDeleteId(null);
    queryClient.invalidateQueries({ queryKey: ['announcements'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Announcements</h2>
          <p className="text-sm text-muted-foreground">Create and manage platform-wide announcements</p>
        </div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />New Announcement</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search announcements..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
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
                <TableHead className="hidden md:table-cell">Publish Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Updated</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements && announcements.length > 0 ? announcements.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="pl-4 max-w-md">
                    <p className="font-medium text-navy truncate">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{item.body}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDate(item.publishDate)}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(item.updatedAt)}</TableCell>
                  <TableCell className="pr-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewItem(item)} title="Preview"><Megaphone className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)} title="Edit"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublish(item)} title={item.status === 'published' ? 'Unpublish' : 'Publish'}>
                        <span className="text-xs">{item.status === 'published' ? 'Unpub' : 'Pub'}</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(item.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground"><Megaphone className="h-8 w-8" /><p>No announcements found.</p></div>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
            <DialogDescription>{editingItem ? 'Update the announcement' : 'Create a new platform announcement'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Announcement title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea placeholder="Announcement content" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="min-h-[120px]" />
            </div>
            <div className="space-y-2">
              <Label>Publish Date</Label>
              <Input type="date" value={form.publishDate} onChange={(e) => setForm({ ...form, publishDate: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{previewItem?.title}</DialogTitle>
            <DialogDescription>{previewItem && formatDateTime(previewItem.publishDate)}</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm leading-relaxed text-foreground">{previewItem?.body}</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Announcement?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
