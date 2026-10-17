import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { OFFICIAL_HELP_CENTER_ARTICLES } from '@/constants/help-center-data';
import { HELP_CENTER_CATEGORIES } from '@/constants';
import type { HelpCenterArticle } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Search, Headphones, Eye, ArrowUpCircle, FileText } from 'lucide-react';
import { formatNumber } from '@/utils/format';

let articleStore = [...OFFICIAL_HELP_CENTER_ARTICLES];

export function HelpCenter() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedArticle, setSelectedArticle] = useState<HelpCenterArticle | null>(null);

  const { data: articles } = useQuery({
    queryKey: ['helpCenter', search, categoryFilter],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 200));
      let filtered = [...articleStore];
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || a.tags.some((t) => t.includes(q)),
        );
      }
      if (categoryFilter !== 'all') filtered = filtered.filter((a) => a.category === categoryFilter);
      return filtered;
    },
  });

  const openArticle = (article: HelpCenterArticle) => {
    const idx = articleStore.findIndex((a) => a.id === article.id);
    if (idx !== -1) {
      articleStore[idx] = { ...articleStore[idx], views: articleStore[idx].views + 1 };
      setSelectedArticle({ ...article, views: article.views + 1 });
      queryClient.invalidateQueries({ queryKey: ['helpCenter'] });
    } else {
      setSelectedArticle(article);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Help Center</h2>
        <p className="text-sm text-muted-foreground">Search FAQs and troubleshooting guides to help resolve user issues</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search articles and guides..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {HELP_CENTER_CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {articles && articles.length > 0 ? articles.map((article) => (
          <Card
            key={article.id}
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => openArticle(article)}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sage/15">
                  <FileText className="h-5 w-5 text-sage" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy line-clamp-2">{article.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{article.category}</p>
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{article.content}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {formatNumber(article.views)} views
                    </span>
                    <span className="text-xs text-primary">Read more</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Headphones className="h-8 w-8" />
                <p>No articles found matching your search.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="border-blue-100 bg-blue-50/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <ArrowUpCircle className="h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-navy">Need to Escalate?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                If you cannot resolve the issue with the available guides, escalate the ticket to the admin team. Follow approved procedures for sensitive requests including data exports, billing disputes, and account verifications.
              </p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/support-team/escalations')}>
                View Escalations
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedArticle?.title}</DialogTitle>
            <DialogDescription>{selectedArticle?.category} - {selectedArticle && formatNumber(selectedArticle.views)} views</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm leading-relaxed text-foreground">{selectedArticle?.content}</p>
            {selectedArticle && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {selectedArticle.tags.map((tag) => (
                  <span key={tag} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
