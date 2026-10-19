import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { contentApi } from '@/services/content.api';
import { CONTENT_TYPES } from '@/constants';
import type { ContentType, ContentStatus, WeeklyTask } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Send, Eye, Plus, Trash2, Sparkles, CheckSquare, Baby } from 'lucide-react';

export function ContentEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditing = id && id !== 'new';
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [week, setWeek] = useState('20');
  const [type, setType] = useState<ContentType>('baby_development');
  const [source, setSource] = useState('ACOG Obstetric Guidelines 2026');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<ContentStatus>('published');

  // Real-time Baby Metrics synced directly to Mother Mobile App
  const [babySize, setBabySize] = useState('');
  const [babyLength, setBabyLength] = useState('');
  const [babyWeight, setBabyWeight] = useState('');
  const [fetalHighlight, setFetalHighlight] = useState('');
  const [maternalTip, setMaternalTip] = useState('');

  // Weekly Tasks State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('medication');
  const [newTaskTimeStr, setNewTaskTimeStr] = useState('08:30 AM');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskRationale, setNewTaskRationale] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  const { data: existingContent, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: () => contentApi.fetchContentById(id!),
    enabled: isEditing === true,
  });

  const { data: weeklyTasks = [], refetch: refetchTasks } = useQuery({
    queryKey: ['weekly-tasks', week],
    queryFn: () => contentApi.fetchTasksForWeek(Number(week) || 20),
    enabled: Number(week) > 0,
  });

  useEffect(() => {
    if (existingContent) {
      setTitle(existingContent.title || '');
      setWeek(String(existingContent.week || 20));
      setType(existingContent.type || 'baby_development');
      setSource(existingContent.source || 'ACOG Obstetric Guidelines 2026');
      setSummary(existingContent.summary || '');
      setBody(existingContent.body || '');
      setStatus(existingContent.status || 'published');
      setBabySize(existingContent.babySize || '');
      setBabyLength(existingContent.babyLength || '');
      setBabyWeight(existingContent.babyWeight || '');
      setFetalHighlight(existingContent.fetalHighlight || '');
      setMaternalTip(existingContent.maternalTip || '');
    }
  }, [existingContent]);

  const handleSave = async () => {
    if (!title.trim() || !summary.trim()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Title and summary are required.' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title,
        week: Number(week),
        type,
        source,
        summary,
        body: body || summary,
        status,
        author: existingContent?.author || 'AparaiTech Clinical Board',
        babySize: babySize || undefined,
        babyLength: babyLength || undefined,
        babyWeight: babyWeight || undefined,
        fetalHighlight: fetalHighlight || undefined,
        maternalTip: maternalTip || undefined,
      };

      if (isEditing && existingContent) {
        await contentApi.updateContent(existingContent.id, payload);
        toast({ title: 'Content Saved', description: 'Article & baby metrics updated in database and pushed to mothers.' });
      } else {
        await contentApi.createContent(payload);
        toast({ title: 'Content Created', description: 'New weekly article saved to database.' });
      }
      queryClient.invalidateQueries({ queryKey: ['content'] });
      navigate('/content');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      toast({ variant: 'destructive', title: 'Task Title Required', description: 'Please enter a task title.' });
      return;
    }
    setAddingTask(true);
    try {
      await contentApi.createWeeklyTask({
        week: Number(week) || 20,
        title: newTaskTitle.trim(),
        category: newTaskCategory,
        timeStr: newTaskTimeStr,
        description: newTaskDesc.trim() || undefined,
        clinicalRationale: newTaskRationale.trim() || undefined,
      });
      toast({ title: 'Task Added', description: `Task added to Week ${week} and synced to mother routines.` });
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskRationale('');
      refetchTasks();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create task.' });
    } finally {
      setAddingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await contentApi.deleteWeeklyTask(taskId);
      toast({ title: 'Task Deleted', description: 'Task removed from weekly routine.' });
      refetchTasks();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete task.' });
    }
  };

  const handleSubmitReview = async () => {
    if (!existingContent) return;
    setSaving(true);
    try {
      await contentApi.submitForReview(existingContent.id);
      toast({ title: 'Submitted for Review', description: 'Content submitted for obstetric review.' });
      navigate('/content');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-32" /><Skeleton className="h-96 w-full" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/content')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-navy">{isEditing ? `Edit Week ${week} Content` : 'New Educational Article'}</h2>
            <p className="text-sm text-muted-foreground">Changes persist directly to Neon DB and reflect in mother & caregiver mobile apps.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={saving} className="bg-rose hover:bg-rose/90 text-white">
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save & Sync Realtime'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-rose" />
                Educational Article & Clinical Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Article Title</Label>
                <Input id="title" placeholder="e.g. Week 20 Fetal Development & Maternal Care" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Executive Summary</Label>
                <Input id="summary" placeholder="Brief summary displayed on mother's home milestone card" value={summary} onChange={(e) => setSummary(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Full Clinical Article / Guidelines</Label>
                <Textarea id="body" placeholder="Detailed developmental milestones, ultrasound guidelines, and maternal health notes..." value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[220px] font-mono text-sm" />
              </div>
            </CardContent>
          </Card>

          {/* Baby Metrics & Comparisons Card */}
          <Card className="border-rose/20 bg-rose/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-rose">
                <Baby className="h-5 w-5" />
                Baby Growth Metrics (Real-Time Mother App Display)
              </CardTitle>
              <CardDescription>
                These values immediately update the Mother Dashboard Milestone Card and Cardiff Kick tracker.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="babySize">Size Comparison (Fruit/Object)</Label>
                  <Input id="babySize" placeholder="e.g. Banana, Papaya" value={babySize} onChange={(e) => setBabySize(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="babyLength">Estimated Length</Label>
                  <Input id="babyLength" placeholder="e.g. 25.6 cm" value={babyLength} onChange={(e) => setBabyLength(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="babyWeight">Estimated Weight</Label>
                  <Input id="babyWeight" placeholder="e.g. 300 g" value={babyWeight} onChange={(e) => setBabyWeight(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fetalHighlight">Fetal Development Highlight</Label>
                <Input id="fetalHighlight" placeholder="e.g. Baby can swallow amniotic fluid and hear mom's voice." value={fetalHighlight} onChange={(e) => setFetalHighlight(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maternalTip">Maternal Care & OB-GYN Tip</Label>
                <Input id="maternalTip" placeholder="e.g. Schedule Level-II anatomy scan. Sleep on your left side." value={maternalTip} onChange={(e) => setMaternalTip(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Weekly Routine Tasks Manager */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-emerald-600" />
                  Routine Checklist Tasks for Week {week}
                </CardTitle>
                <CardDescription>
                  Tasks created here automatically appear in the mother's daily routine & checklist for this week.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-semibold">{weeklyTasks.length} Live Tasks</Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Tasks List */}
              <div className="space-y-2">
                {weeklyTasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No custom tasks for this week yet. Default clinical tasks will apply.</p>
                ) : (
                  <div className="divide-y divide-border border rounded-md overflow-hidden">
                    {weeklyTasks.map((task: WeeklyTask) => (
                      <div key={task.id} className="p-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-navy">{task.title}</span>
                            <Badge variant="secondary" className="text-xs uppercase">{task.category}</Badge>
                            {task.timeStr && <span className="text-xs text-muted-foreground font-mono">⏰ {task.timeStr}</span>}
                          </div>
                          {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
                          {task.clinicalRationale && <p className="text-xs text-emerald-700 italic">Rationale: {task.clinicalRationale}</p>}
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} className="text-destructive hover:bg-destructive/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Task Form */}
              <div className="rounded-lg border border-border p-4 bg-muted/20 space-y-4">
                <h4 className="text-sm font-bold text-navy flex items-center gap-2">
                  <Plus className="h-4 w-4 text-rose" />
                  Add New Task for Week {week}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs">Task Title</Label>
                    <Input placeholder="e.g. Schedule Level-II Ultrasound" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Category</Label>
                    <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medication">Medication / Vitamins</SelectItem>
                        <SelectItem value="hydration">Hydration</SelectItem>
                        <SelectItem value="exercise">Exercise / Stretch</SelectItem>
                        <SelectItem value="kicks">Cardiff Kicks</SelectItem>
                        <SelectItem value="nutrition">Nutrition</SelectItem>
                        <SelectItem value="clinical">Clinical / Doctor</SelectItem>
                        <SelectItem value="planning">Birth Planning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Scheduled Time</Label>
                    <Input placeholder="e.g. 09:00 AM or Post-Dinner" value={newTaskTimeStr} onChange={(e) => setNewTaskTimeStr(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Clinical Rationale (Why this matters)</Label>
                    <Input placeholder="e.g. Confirms anatomical development & placenta position" value={newTaskRationale} onChange={(e) => setNewTaskRationale(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Description / Guidance</Label>
                  <Input placeholder="e.g. Bring previous scan report and maternal blood test files." value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} />
                </div>
                <Button onClick={handleCreateTask} disabled={addingTask} size="sm" className="bg-navy hover:bg-navy/90 text-white">
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  {addingTask ? 'Adding...' : 'Add Task to Neon DB'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings Area */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Metadata & Publishing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="week">Pregnancy Week (1 - 40)</Label>
                <Input id="week" type="number" min={1} max={40} value={week} onChange={(e) => setWeek(e.target.value)} />
                <p className="text-xs text-muted-foreground">Directly targets mothers in this gestational week.</p>
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
                <Label htmlFor="source">Content Source / Authority</Label>
                <Input id="source" placeholder="e.g. ACOG Guidelines 2026" value={source} onChange={(e) => setSource(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as ContentStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published (Live to Mothers)</SelectItem>
                    <SelectItem value="draft">Draft (Admin Only)</SelectItem>
                    <SelectItem value="review">Under Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isEditing && (
                <div className="space-y-2">
                  <div className="rounded-lg border border-border p-3 text-sm">
                    <p className="capitalize font-medium text-navy">Status: {status}</p>
                    {existingContent?.reviewedAt && <p className="text-xs text-muted-foreground mt-1">Reviewed: {new Date(existingContent.reviewedAt).toLocaleDateString()}</p>}
                    <p className="text-xs text-muted-foreground">Version: v{existingContent?.version || 1}</p>
                  </div>
                </div>
              )}
              <Separator />
              <div className="flex flex-col gap-2">
                <Button onClick={handleSave} disabled={saving} className="bg-rose hover:bg-rose/90 text-white">
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save & Publish to DB'}
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
    </div>
  );
}
