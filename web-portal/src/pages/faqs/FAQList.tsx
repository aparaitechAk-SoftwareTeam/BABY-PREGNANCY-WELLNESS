import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { OFFICIAL_FAQS } from '@/constants/official-faqs';
import { FAQ_CATEGORIES } from '@/constants';
import type { FAQ } from '@/types';
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
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Edit, HelpCircle, Trash2, Eye, EyeOff } from 'lucide-react';
import { formatDate } from '@/utils/format';

let faqStore = [...OFFICIAL_FAQS];

export function FAQList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editOpen, setEditOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({ question: '', answer: '', category: FAQ_CATEGORIES[0] });

  const { data: faqs } = useQuery({
    queryKey: ['faqs', search, categoryFilter, statusFilter],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      let filtered = [...faqStore];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
      }
      if (categoryFilter !== 'all') filtered = filtered.filter((f) => f.category === categoryFilter);
      if (statusFilter !== 'all') filtered = filtered.filter((f) => f.status === statusFilter);
      return filtered;
    },
  });

  const openNew = () => {
    setEditingFaq(null);
    setForm({ question: '', answer: '', category: FAQ_CATEGORIES[0] });
    setEditOpen(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category });
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!form.question.trim() || !form.answer.trim()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Question and answer are required.' });
      return;
    }
    if (editingFaq) {
      const idx = faqStore.findIndex((f) => f.id === editingFaq.id);
      if (idx !== -1) {
        faqStore[idx] = { ...faqStore[idx], ...form, updatedAt: new Date().toISOString() };
      }
      toast({ title: 'FAQ Updated', description: 'The FAQ has been updated successfully.' });
    } else {
      faqStore.unshift({
        id: `f-${String(faqStore.length + 1).padStart(3, '0')}`,
        ...form,
        status: 'unpublished',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast({ title: 'FAQ Created', description: 'The FAQ has been created as unpublished.' });
    }
    setEditOpen(false);
    queryClient.invalidateQueries({ queryKey: ['faqs'] });
  };

  const togglePublish = (faq: FAQ) => {
    const idx = faqStore.findIndex((f) => f.id === faq.id);
    if (idx !== -1) {
      faqStore[idx] = { ...faqStore[idx], status: faqStore[idx].status === 'published' ? 'unpublished' : 'published', updatedAt: new Date().toISOString() };
      toast({ title: faqStore[idx].status === 'published' ? 'FAQ Published' : 'FAQ Unpublished', description: faqStore[idx].question });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    faqStore = faqStore.filter((f) => f.id !== deleteId);
    toast({ title: 'FAQ Deleted', description: 'The FAQ has been removed.' });
    setDeleteId(null);
    queryClient.invalidateQueries({ queryKey: ['faqs'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">FAQ Management</h2>
          <p className="text-sm text-muted-foreground">Create, edit, categorize, and publish frequently asked questions</p>
        </div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />New FAQ</Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search FAQs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {FAQ_CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="unpublished">Unpublished</SelectItem>
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
                <TableHead className="pl-4">Question</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Updated</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs && faqs.length > 0 ? faqs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell className="pl-4 max-w-md">
                    <p className="font-medium text-navy truncate">{faq.question}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{faq.answer}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{faq.category}</TableCell>
                  <TableCell><StatusBadge status={faq.status} /></TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(faq.updatedAt)}</TableCell>
                  <TableCell className="pr-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(faq)} title="Edit"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublish(faq)} title={faq.status === 'published' ? 'Unpublish' : 'Publish'}>
                        {faq.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(faq.id)} title="Delete"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground"><HelpCircle className="h-8 w-8" /><p>No FAQs found.</p></div>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'Edit FAQ' : 'New FAQ'}</DialogTitle>
            <DialogDescription>{editingFaq ? 'Update the question and answer' : 'Create a new frequently asked question'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Input placeholder="Enter the question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Answer</Label>
              <Textarea placeholder="Enter the answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className="min-h-[120px]" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FAQ_CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete FAQ?</DialogTitle>
            <DialogDescription>This action cannot be undone. The FAQ will be permanently removed.</DialogDescription>
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
