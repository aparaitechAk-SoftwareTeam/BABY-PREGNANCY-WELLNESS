import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '@/services/content.api';
import { PAGE_SIZE_OPTIONS, CONTENT_TYPES } from '@/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from '@/components/ui/pagination';
import { StatusBadge } from '@/components/tables/DataTableCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Eye, Send, CheckCircle2, BookOpen } from 'lucide-react';
import { formatDate, formatNumber } from '@/utils/format';

export function ContentList() {
  const navigate = useNavigate();
  const location = useLocation();
  const isWeekByWeek = location.pathname === '/content/week-by-week';

  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState(isWeekByWeek ? 'baby_development' : 'all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setTypeFilter(isWeekByWeek ? 'baby_development' : 'all');
    setPage(1);
  }, [location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['content', page, pageSize, debouncedSearch, statusFilter, typeFilter],
    queryFn: () => contentApi.fetchContent(page, pageSize, debouncedSearch, statusFilter, typeFilter),
  });

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  const handleSubmitReview = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await contentApi.submitForReview(id);
      toast({ title: result.success ? 'Submitted for Review' : 'Action Failed', description: result.message, variant: result.success ? 'default' : 'destructive' });
    } finally { setActionLoading(null); }
  };

  const handlePublish = async (id: string) => {
    setActionLoading(id);
    try {
      const result = await contentApi.publishContent(id);
      toast({ title: result.success ? 'Content Published' : 'Action Failed', description: result.message, variant: result.success ? 'default' : 'destructive' });
    } finally { setActionLoading(null); }
  };

  const renderPaginationNumbers = () => {
    const items: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) items.push(i);
    return items;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">
            {isWeekByWeek ? 'Week-by-Week Development Guides' : 'Pregnancy Content Management'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isWeekByWeek
              ? 'Manage 40-week fetal milestones, size analogies, and weekly maternal tips'
              : 'Manage educational articles, wellness guides, and clinical content'}
          </p>
        </div>
        <Button onClick={() => navigate('/content/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Article
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="review">In Review</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {CONTENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((s) => (<SelectItem key={s} value={String(s)}>{s} per page</SelectItem>))}
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
                <TableHead className="hidden md:table-cell">Week</TableHead>
                <TableHead className="hidden lg:table-cell">Type</TableHead>
                <TableHead className="hidden sm:table-cell">Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Version</TableHead>
                <TableHead className="hidden lg:table-cell">Updated</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={8} className="pl-4"><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ))
              ) : data && data.data.length > 0 ? (
                data.data.map((item) => (
                  <TableRow key={item.id} className="cursor-pointer" onClick={() => navigate(`/content/${item.id}`)}>
                    <TableCell className="pl-4 font-medium text-navy max-w-xs truncate">{item.title}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{item.week > 0 ? `Week ${item.week}` : 'General'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground capitalize">{item.type.replace('_', ' ')}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{item.author}</TableCell>
                    <TableCell><StatusBadge status={item.status} /></TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">v{item.version}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{formatDate(item.updatedAt)}</TableCell>
                    <TableCell className="pr-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/content/${item.id}/preview`)} title="Preview">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {item.status === 'draft' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSubmitReview(item.id)} disabled={actionLoading === item.id} title="Submit for Review">
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {item.status === 'review' && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-sage hover:text-sage" onClick={() => handlePublish(item.id)} disabled={actionLoading === item.id} title="Publish">
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-8 w-8" />
                      <p>No content found matching your filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data && data.total > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, data.total)} of {formatNumber(data.total)} articles
          </p>
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem><PaginationPrevious onClick={() => setPage(Math.max(1, page - 1))} className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} /></PaginationItem>
                {renderPaginationNumbers().map((p) => (
                  <PaginationItem key={p}><PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer">{p}</PaginationLink></PaginationItem>
                ))}
                <PaginationItem><PaginationNext onClick={() => setPage(Math.min(totalPages, page + 1))} className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} /></PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
