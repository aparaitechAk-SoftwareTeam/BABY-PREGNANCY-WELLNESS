import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { SYSTEM_PERMISSIONS, INITIAL_ROLE_ASSIGNMENTS } from '@/constants/permissions';
import type { UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Shield, ShieldCheck, Plus, Edit, AlertTriangle } from 'lucide-react';
import { formatDate } from '@/utils/format';

let roleStore = [...INITIAL_ROLE_ASSIGNMENTS];

export function RoleManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', displayName: '', role: 'support_agent' as UserRole, permissions: [] as string[] });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      return [...roleStore];
    },
  });

  const openNew = () => {
    setEditingId(null);
    setForm({ email: '', displayName: '', role: 'support_agent', permissions: [] });
    setEditOpen(true);
  };

  const openEdit = (id: string) => {
    const assignment = roleStore.find((r) => r.id === id);
    if (assignment) {
      setEditingId(id);
      setForm({ email: assignment.email, displayName: assignment.displayName, role: assignment.role, permissions: assignment.permissions });
      setEditOpen(true);
    }
  };

  const handleSave = () => {
    if (!form.email.trim() || !form.displayName.trim()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Email and display name are required.' });
      return;
    }
    if (editingId) {
      const idx = roleStore.findIndex((r) => r.id === editingId);
      if (idx !== -1) {
        roleStore[idx] = { ...roleStore[idx], ...form };
      }
      toast({ title: 'Role Updated', description: 'Role assignment has been updated.' });
    } else {
      roleStore.unshift({
        id: `ra-${String(roleStore.length + 1).padStart(3, '0')}`,
        userId: `admin-${String(roleStore.length + 1).padStart(3, '0')}`,
        ...form,
        assignedAt: new Date().toISOString(),
      });
      toast({ title: 'Role Assigned', description: 'New role assignment has been created.' });
    }
    setEditOpen(false);
    queryClient.invalidateQueries({ queryKey: ['roles'] });
  };

  const togglePermission = (permName: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permName)
        ? prev.permissions.filter((p) => p !== permName)
        : [...prev.permissions, permName],
    }));
  };

  const modules = [...new Set(SYSTEM_PERMISSIONS.map((p) => p.module))];
  const admins = roles?.filter((r) => r.role === 'admin') || [];
  const agents = roles?.filter((r) => r.role === 'support_agent') || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-navy">Role & Permission Management</h2>
          <p className="text-sm text-muted-foreground">Manage role assignments and permissions for admin team members</p>
        </div>
        <Button onClick={openNew}><Plus className="mr-2 h-4 w-4" />Assign Role</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">{admins.length}</p>
              <p className="text-sm text-muted-foreground">Administrators</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage/15">
              <Shield className="h-6 w-6 text-sage" />
            </div>
            <div>
              <p className="text-2xl font-bold text-navy">{agents.length}</p>
              <p className="text-sm text-muted-foreground">Support Agents</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-800">
            <strong>Security Policy:</strong> Support agents must not automatically receive administrator privileges. Permission changes are logged in the audit trail. The backend must enforce authorization at all times.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-navy">Role Assignments</CardTitle>
          <CardDescription>Manage who has access to what</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {roles?.map((assignment) => (
            <div key={assignment.id} className="flex flex-col gap-3 rounded-lg border border-border/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={assignment.role === 'admin' ? 'bg-primary/15 text-primary' : 'bg-sage/15 text-sage'}>
                    {assignment.displayName.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-navy">{assignment.displayName}</p>
                  <p className="text-xs text-muted-foreground">{assignment.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={assignment.role === 'admin' ? 'default' : 'secondary'} className={assignment.role === 'admin' ? 'bg-primary/10 text-primary border-primary/20' : ''}>
                  <Shield className="mr-1 h-3 w-3" />
                  {assignment.role === 'admin' ? 'Administrator' : 'Support Agent'}
                </Badge>
                <span className="hidden text-xs text-muted-foreground sm:inline">Since {formatDate(assignment.assignedAt)}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(assignment.id)} title="Edit Permissions">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Role & Permissions' : 'Assign Role'}</DialogTitle>
            <DialogDescription>{editingId ? 'Update role and permissions for this team member' : 'Assign a role and permissions to a new team member'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input placeholder="Full name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input placeholder="email@aparaitech.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="support_agent">Support Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div>
              <Label className="mb-3 block">Permissions</Label>
              <div className="space-y-4">
                {modules.map((module) => (
                  <div key={module}>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">{module}</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {SYSTEM_PERMISSIONS.filter((p) => p.module === module).map((perm) => (
                        <div key={perm.id} className="flex items-center space-x-2 rounded-lg border border-border/50 p-2">
                          <Checkbox
                            id={perm.id}
                            checked={form.permissions.includes(perm.name)}
                            onCheckedChange={() => togglePermission(perm.name)}
                          />
                          <label htmlFor={perm.id} className="text-sm cursor-pointer">
                            <span className="font-medium text-foreground">{perm.name}</span>
                            <span className="block text-xs text-muted-foreground">{perm.description}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
