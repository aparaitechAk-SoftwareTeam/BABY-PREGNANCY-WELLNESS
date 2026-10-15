import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi } from '@/services/notifications.api';
import { NOTIFICATION_AUDIENCES } from '@/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';

export function NotificationEditor() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all_users');
  const [scheduledAt, setScheduledAt] = useState('');

  const handleSave = async () => {
    if (!title.trim() || !message.trim()) {
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Title and message are required.' });
      return;
    }
    try {
      await notificationsApi.createNotification({
        title, message,
        audience: audience as any,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : new Date().toISOString(),
      });
      toast({ title: 'Notification Created', description: 'Campaign has been created as a draft.' });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      navigate('/notifications');
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create notification.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/notifications')}><ArrowLeft className="h-5 w-5" /></Button>
        <div><h2 className="text-xl font-bold text-navy">New Notification Campaign</h2><p className="text-sm text-muted-foreground">Create an informational, non-diagnostic notification</p></div>
      </div>
      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="text-base">Campaign Details</CardTitle><CardDescription>Fill in the campaign title, message, audience, and schedule</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Title</Label><Input placeholder="Campaign title" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="space-y-2"><Label>Message</Label><Textarea placeholder="Notification message (informational, non-alarming)" value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[120px]" /></div>
          <div className="space-y-2"><Label>Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{NOTIFICATION_AUDIENCES.map((a) => (<SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Schedule (optional)</Label><Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} /></div>
          <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
            <p className="text-xs text-blue-800">Notifications must be informational and non-diagnostic. Avoid alarming language or medical directives. All campaigns require approval before sending.</p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />Create Draft</Button>
            <Button variant="outline" onClick={() => navigate('/notifications')}><ArrowLeft className="mr-2 h-4 w-4" />Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
