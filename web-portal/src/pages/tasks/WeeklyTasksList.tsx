import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentApi } from '@/services/content.api';
import { usersApi } from '@/services/users.api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatCard } from '@/components/dashboard/StatCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  User,
  Globe,
  Filter,
  CheckSquare,
  Activity,
  HeartPulse,
} from 'lucide-react';

const TASK_CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'medication', label: 'Medication & Vitamins' },
  { value: 'clinical', label: 'Clinical Scans & Lab Tests' },
  { value: 'hydration', label: 'Hydration Target' },
  { value: 'nutrition', label: 'Nutrition & Diet' },
  { value: 'exercise', label: 'Safe Exercise & Stretches' },
  { value: 'kicks', label: 'Fetal Kick Counting' },
  { value: 'sleep', label: 'Sleep & Ergonomics' },
  { value: 'planning', label: 'Birth & Hospital Prep' },
];

const EMOJI_OPTIONS = [
  '💊', '💧', '🩺', '🔬', '🩸', '🧘‍♀️', '🥗', '🥛', '👣', '🛏️', '🎒', '📋', '🌸', '🍎', '👶'
];

interface WeeklyTaskItem {
  id: string;
  week: number;
  title: string;
  category: string;
  timeStr?: string;
  timeOfDay?: string;
  emoji?: string;
  description?: string;
  clinicalRationale?: string;
  isCompleted?: boolean;
  userId?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt?: string;
}

export function WeeklyTasksList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [weekFilter, setWeekFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [targetFilter, setTargetFilter] = useState<string>('all');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<WeeklyTaskItem | null>(null);

  // Form state
  const [formWeek, setFormWeek] = useState<number>(20);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('clinical');
  const [formTimeStr, setFormTimeStr] = useState('09:00 AM');
  const [formTimeOfDay, setFormTimeOfDay] = useState('morning');
  const [formEmoji, setFormEmoji] = useState('🩺');
  const [formDescription, setFormDescription] = useState('');
  const [formClinicalRationale, setFormClinicalRationale] = useState('');
  const [formTargetType, setFormTargetType] = useState<'global' | 'specific'>('global');
  const [formUserId, setFormUserId] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Load mothers/users for the user assignment dropdown
  const { data: usersData } = useQuery({
    queryKey: ['mothers-list'],
    queryFn: () => usersApi.fetchUsers(1, 100),
  });

  const mothersList = usersData?.data || [];

  // Load Tasks
  const { data: tasks = [], isLoading } = useQuery<WeeklyTaskItem[]>({
    queryKey: ['admin-tasks', weekFilter, categoryFilter, targetFilter, debouncedSearch],
    queryFn: () =>
      contentApi.fetchAdminTasks({
        week: weekFilter !== 'all' ? Number(weekFilter) : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        userId: targetFilter,
        search: debouncedSearch || undefined,
      }),
  });

  // Create or Update Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        week: Number(formWeek),
        title: formTitle.trim(),
        category: formCategory,
        timeStr: formTimeStr.trim(),
        timeOfDay: formTimeOfDay,
        emoji: formEmoji,
        description: formDescription.trim(),
        clinicalRationale: formClinicalRationale.trim(),
        userId: formTargetType === 'specific' && formUserId ? formUserId : null,
      };

      if (editingTask) {
        return contentApi.updateWeeklyTask(editingTask.id, payload);
      } else {
        return contentApi.createWeeklyTask(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      toast({
        title: editingTask ? 'Task Updated' : 'Weekly Task Created',
        description: `Successfully saved task for Week ${formWeek}.`,
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast({
        title: 'Failed to Save Task',
        description: err?.response?.data?.message || err?.message || 'An error occurred.',
        variant: 'destructive',
      });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => contentApi.deleteWeeklyTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      toast({
        title: 'Task Deleted',
        description: 'The weekly task has been removed from the schedule.',
      });
    },
    onError: () => {
      toast({
        title: 'Delete Failed',
        description: 'Could not delete task.',
        variant: 'destructive',
      });
    },
  });

  const handleOpenCreate = () => {
    resetForm();
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (task: WeeklyTaskItem) => {
    setEditingTask(task);
    setFormWeek(task.week || 20);
    setFormTitle(task.title || '');
    setFormCategory(task.category || 'clinical');
    setFormTimeStr(task.timeStr || '');
    setFormTimeOfDay(task.timeOfDay || 'morning');
    setFormEmoji(task.emoji || '🩺');
    setFormDescription(task.description || '');
    setFormClinicalRationale(task.clinicalRationale || '');
    if (task.userId) {
      setFormTargetType('specific');
      setFormUserId(task.userId);
    } else {
      setFormTargetType('global');
      setFormUserId('');
    }
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingTask(null);
    setFormWeek(20);
    setFormTitle('');
    setFormCategory('clinical');
    setFormTimeStr('09:00 AM');
    setFormTimeOfDay('morning');
    setFormEmoji('🩺');
    setFormDescription('');
    setFormClinicalRationale('');
    setFormTargetType('global');
    setFormUserId('');
  };

  // Metrics calculation
  const totalTasks = tasks.length;
  const clinicalTasks = tasks.filter((t) => t.category === 'clinical' || t.category === 'medication').length;
  const wellnessTasks = tasks.filter((t) => t.category === 'hydration' || t.category === 'exercise' || t.category === 'nutrition').length;
  const personalizedTasks = tasks.filter((t) => !!t.userId).length;

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'medication':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'clinical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'hydration':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'exercise':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'nutrition':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'kicks':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'planning':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            Weekly Tasks & Clinical Routines
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure 40-week gestational checklists (vitamins, hydration, Level-II scans) and assign personalized tasks to mothers based on symptoms and profiles.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Add Weekly Task
        </Button>
      </div>

      {/* Real-time Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Scheduled Tasks"
          value={isLoading ? '...' : String(totalTasks)}
          icon={<CheckSquare className="h-5 w-5" />}
          accent="primary"
          trendLabel="active checklist items"
        />
        <StatCard
          title="Clinical & Medical Checks"
          value={isLoading ? '...' : String(clinicalTasks)}
          icon={<HeartPulse className="h-5 w-5" />}
          accent="blush"
          trendLabel="scans, labs & prescriptions"
        />
        <StatCard
          title="Wellness & Hydration"
          value={isLoading ? '...' : String(wellnessTasks)}
          icon={<Activity className="h-5 w-5" />}
          accent="sage"
          trendLabel="daily hydration & yoga"
        />
        <StatCard
          title="Personalized Patient Tasks"
          value={isLoading ? '...' : String(personalizedTasks)}
          icon={<User className="h-5 w-5" />}
          accent="navy"
          trendLabel="tailored to mother profile"
        />
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, rationale, advice..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Week Selector */}
            <Select value={weekFilter} onValueChange={setWeekFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="All Weeks" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="all">All Weeks (1 - 40)</SelectItem>
                {Array.from({ length: 40 }).map((_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    Week {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Selector */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {TASK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Target Audience Filter */}
            <Select value={targetFilter} onValueChange={setTargetFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Target Audience" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Target Scopes</SelectItem>
                <SelectItem value="global">Global (All Mothers in Week)</SelectItem>
                {mothersList.slice(0, 10).map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    Mother: {u.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-20 pl-4">Week</TableHead>
                <TableHead>Task & Details</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden sm:table-cell">Schedule</TableHead>
                <TableHead className="hidden lg:table-cell">Target Audience</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6} className="p-4">
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : tasks.length > 0 ? (
                tasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-muted/30">
                    {/* Week Badge */}
                    <TableCell className="pl-4 font-semibold">
                      <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-xs whitespace-nowrap">
                        Week {task.week}
                      </Badge>
                    </TableCell>

                    {/* Title & Description */}
                    <TableCell className="max-w-md">
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl shrink-0 mt-0.5">{task.emoji || '📋'}</span>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-navy text-sm leading-tight">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                          )}
                          {task.clinicalRationale && (
                            <p className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block mt-1 font-medium">
                              🩺 Rationale: {task.clinicalRationale}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className={`text-xs capitalize font-medium ${getCategoryBadgeClass(task.category)}`}>
                        {task.category.replace('_', ' ')}
                      </Badge>
                    </TableCell>

                    {/* Time / Schedule */}
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="capitalize">{task.timeOfDay || 'Morning'}</span>
                        {task.timeStr && <span>• {task.timeStr}</span>}
                      </div>
                    </TableCell>

                    {/* Target Audience */}
                    <TableCell className="hidden lg:table-cell">
                      {task.userId && task.user ? (
                        <div className="flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                          <User className="h-3.5 w-3.5 text-purple-600" />
                          <span className="truncate max-w-[140px] font-medium" title={task.user.email}>
                            {task.user.name || task.user.email}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          <Globe className="h-3.5 w-3.5 text-slate-500" />
                          <span>Global (All Week {task.week} Mothers)</span>
                        </div>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-navy"
                          onClick={() => handleOpenEdit(task)}
                          title="Edit Task"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            if (window.confirm(`Delete task "${task.title}" for Week ${task.week}?`)) {
                              deleteMutation.mutate(task.id);
                            }
                          }}
                          title="Delete Task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <CheckSquare className="h-10 w-10 text-muted-foreground/40" />
                      <p className="font-semibold text-base text-navy">No tasks found</p>
                      <p className="text-xs">Try selecting a different gestational week or category filter.</p>
                      <Button variant="outline" size="sm" onClick={handleOpenCreate} className="mt-2">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Task
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add / Edit Task Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-navy flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              {editingTask ? `Edit Task (Week ${formWeek})` : 'Create Weekly Routine Task'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Configure gestational checklists. You can make this task a standard global routine or tailor it to a specific mother’s medical profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm">
            {/* Week & Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-navy">Gestational Week (1 - 40) *</label>
                <Select value={String(formWeek)} onValueChange={(v) => setFormWeek(Number(v))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-52">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        Week {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-navy">Category *</label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_CATEGORIES.filter((c) => c.value !== 'all').map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Title & Emoji */}
            <div className="grid grid-cols-5 gap-3">
              <div className="col-span-1">
                <label className="text-xs font-semibold text-navy">Icon</label>
                <Select value={formEmoji} onValueChange={setFormEmoji}>
                  <SelectTrigger className="mt-1 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMOJI_OPTIONS.map((e) => (
                      <SelectItem key={e} value={e} className="text-lg">
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-4">
                <label className="text-xs font-semibold text-navy">Task Title *</label>
                <Input
                  className="mt-1"
                  placeholder="e.g. Morning Folic Acid & Iron Dosage"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
            </div>

            {/* Time of Day & Time String */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-navy">Time of Day</label>
                <Select value={formTimeOfDay} onValueChange={setFormTimeOfDay}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning 🌅</SelectItem>
                    <SelectItem value="afternoon">Afternoon ☀️</SelectItem>
                    <SelectItem value="evening">Evening 🌇</SelectItem>
                    <SelectItem value="night">Night 🌙</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-navy">Suggested Time</label>
                <Input
                  className="mt-1"
                  placeholder="e.g. 08:30 AM"
                  value={formTimeStr}
                  onChange={(e) => setFormTimeStr(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-navy">Actionable Description for Mother</label>
              <textarea
                className="mt-1 w-full rounded-md border border-input bg-background p-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={3}
                placeholder="Give clear steps, e.g. Take 400mcg tablet after breakfast with citrus juice to maximize bioavailability..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            {/* Clinical Rationale */}
            <div>
              <label className="text-xs font-semibold text-navy">Clinical Obstetric Rationale</label>
              <Input
                className="mt-1 text-xs"
                placeholder="e.g. Reduces neural tube defects by 70% and prevents maternal iron-deficiency anemia."
                value={formClinicalRationale}
                onChange={(e) => setFormClinicalRationale(e.target.value)}
              />
            </div>

            {/* Target Audience Scope */}
            <div className="rounded-lg border border-border p-3 space-y-2 bg-muted/20">
              <label className="text-xs font-semibold text-navy block">Target Patient Scope</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={formTargetType === 'global' ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs justify-start gap-2"
                  onClick={() => {
                    setFormTargetType('global');
                    setFormUserId('');
                  }}
                >
                  <Globe className="h-4 w-4" />
                  Global for Week {formWeek}
                </Button>
                <Button
                  type="button"
                  variant={formTargetType === 'specific' ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs justify-start gap-2"
                  onClick={() => setFormTargetType('specific')}
                >
                  <User className="h-4 w-4" />
                  Specific Mother Profile
                </Button>
              </div>

              {formTargetType === 'specific' && (
                <div className="pt-2">
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">
                    Select Patient / Mother:
                  </label>
                  <Select value={formUserId} onValueChange={setFormUserId}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Choose a mother..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-52">
                      {mothersList.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.displayName} ({m.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Personalized task will appear exclusively on this mother’s routine checklist based on her profile symptoms/BMI.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => saveMutation.mutate()}
              disabled={!formTitle.trim() || saveMutation.isPending}
            >
              {saveMutation.isPending ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
