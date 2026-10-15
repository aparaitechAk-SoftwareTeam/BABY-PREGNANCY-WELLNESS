import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '@/services/content.api';
import { CONTENT_TYPES } from '@/constants';
import type { ContentType, ContentStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Send, Eye } from 'lucide-react';

export function ContentEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = id && id !== 'new';
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [week, setWeek] = useState('0');
  const [type, setType] = useState<ContentType>('baby_development');
  const [source, setSource] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<ContentStatus>('draft');

  const { data: existingContent, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentApi.fetchContentById(id!),
    enabled: isEditing === true,
  });

  useEffect(() => {
    if (existingContent) {
      setTitle(existingContent.title);
      setWeek(String(existingContent.week));
      setType(existingContent.type);
      setSource(existingContent.source);
      setSummary(existingContent.summary);
      setBody(existingContent.body);
      setStatus(existingContent.status);
    }
  }, [existingContent]);

  const handleSave = async () => {
    if (!title.trim() || !summary.trim() || !body.trim()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Title, summary, and body are required.' });
      return;
    }
    setSaving(true);
    try {
      const payload = { title, week: Number(week), type, source, summary, body, status, author: existingContent?.author || 'Current Admin' };
      if (isEditing && existingContent) {
        await contentApi.updateContent(existingContent.id, payload);
        toast({ title: 'Content Saved', description: 'Article has been updated successfully.' });
      } else {
        await contentApi.createContent(payload);
        toast({ title: 'Content Created', description: 'New article has been created as a draft.' });
      }
      navigate('/content');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!existingContent) return;
    setSaving(true);
    try {
      await contentApi.submitForReview(existingContent.id);
      toast({ title: 'Submitted for Review', description: 'Content has been submitted for review.' });
      navigate('/content');
    } finally { setSaving(false); }
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-32" /><Skeleton className="h-96 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/content')}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-xl font-bold text-navy">{isEditing ? 'Edit Article' : 'New Article'}</h2>
          <p className="text-sm text-muted-foreground">{isEditing ? `Editing: ${existingContent?.title}` : 'Create a new educational article'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Content</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Article title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Input id="summary" placeholder="Brief summary for listings and previews" value={summary} onChange={(e) => setSummary(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body (Markdown supported)</Label>
              <Textarea id="body" placeholder="Write your article content here..." value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[300px] font-mono text-sm" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="week">Pregnancy Week</Label>
              <Input id="week" type="number" min={0} max={42} value={week} onChange={(e) => setWeek(e.target.value)} />
              <p className="text-xs text-muted-foreground">Use 0 for general content</p>
            </div>
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as ContentType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Content Source</Label>
              <Input id="source" placeholder="e.g., ACOG Guidelines 2025" value={source} onChange={(e) => setSource(e.target.value)} />
            </div>
            {isEditing && (
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="rounded-lg border border-border p-3 text-sm">
                  <p className="capitalize font-medium text-navy">{status}</p>
                  {existingContent?.reviewedAt && <p className="text-xs text-muted-foreground mt-1">Reviewed: {new Date(existingContent.reviewedAt).toLocaleDateString()}</p>}
                  <p className="text-xs text-muted-foreground">Version: v{existingContent?.version}</p>
                </div>
              </div>
            )}
            <Separator />
            <div className="flex flex-col gap-2">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Draft'}
              </Button>
              {isEditing && existingContent && status === 'draft' && (
                <Button variant="outline" onClick={handleSubmitReview} disabled={saving}>
                  <Send className="mr-2 h-4 w-4" />
                  Submit for Review
                </Button>
              )}
              {isEditing && (
                <Button variant="outline" onClick={() => navigate(`/content/${id}/preview`)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
