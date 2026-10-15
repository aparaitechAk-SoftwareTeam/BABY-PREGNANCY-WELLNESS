import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { mockSupportTickets } from '@/mocks/support.mock';
import { User, Bell, Shield, Save, Clock, CheckCircle2, Inbox } from 'lucide-react';
import { formatNumber, formatDate } from '@/utils/format';

export function SupportProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({ newTicket: true, escalation: true, ticketUpdate: true, weekly: false });
  const [timezone, setTimezone] = useState('UTC');

  const myTickets = mockSupportTickets.filter((t) => t.assignedAgentId === user?.id);
  const myOpen = myTickets.filter((t) => t.status === 'open' || t.status === 'awaiting_response').length;
  const myResolved = myTickets.filter((t) => t.status === 'resolved').length;
  const myEscalated = myTickets.filter((t) => t.status === 'escalated').length;

  const handleSave = () => {
    toast({ title: 'Profile Saved', description: 'Your preferences have been updated.' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">My Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your support agent profile and preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Inbox className="h-6 w-6 text-primary" />
            </div>
            <div><p className="text-2xl font-bold text-navy">{myOpen}</p><p className="text-sm text-muted-foreground">Open Tickets</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage/15">
              <CheckCircle2 className="h-6 w-6 text-sage" />
            </div>
            <div><p className="text-2xl font-bold text-navy">{myResolved}</p><p className="text-sm text-muted-foreground">Resolved</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
              <Clock className="h-6 w-6 text-destructive" />
            </div>
            <div><p className="text-2xl font-bold text-navy">{myEscalated}</p><p className="text-sm text-muted-foreground">Escalated</p></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-navy flex items-center gap-2"><User className="h-4 w-4" />Profile</CardTitle>
            <CardDescription>Your support agent account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-3 pb-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-sage/15 text-sage text-xl font-semibold">
                  {user?.displayName?.split(' ').map((n) => n[0]).join('') || 'SA'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-semibold text-navy">{user?.displayName}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary" className="mt-1 bg-sage/15 text-sage">Support Agent</Badge>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input defaultValue={user?.displayName} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={user?.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Agent ID</Label>
              <Input defaultValue={user?.id} disabled />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-navy flex items-center gap-2"><Bell className="h-4 w-4" />Notification Preferences</CardTitle>
            <CardDescription>Manage alert preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div><p className="text-sm font-medium text-navy">New Ticket Assigned</p><p className="text-xs text-muted-foreground">Get notified when a ticket is assigned to you</p></div>
              <Switch checked={notifications.newTicket} onCheckedChange={(v) => setNotifications({ ...notifications, newTicket: v })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div><p className="text-sm font-medium text-navy">Escalation Alerts</p><p className="text-xs text-muted-foreground">Receive alerts for ticket escalations</p></div>
              <Switch checked={notifications.escalation} onCheckedChange={(v) => setNotifications({ ...notifications, escalation: v })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div><p className="text-sm font-medium text-navy">Ticket Updates</p><p className="text-xs text-muted-foreground">Get notified when users respond to tickets</p></div>
              <Switch checked={notifications.ticketUpdate} onCheckedChange={(v) => setNotifications({ ...notifications, ticketUpdate: v })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div><p className="text-sm font-medium text-navy">Weekly Digest</p><p className="text-xs text-muted-foreground">Weekly performance summary</p></div>
              <Switch checked={notifications.weekly} onCheckedChange={(v) => setNotifications({ ...notifications, weekly: v })} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-navy flex items-center gap-2"><Shield className="h-4 w-4" />Preferences</CardTitle>
            <CardDescription>Application settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern (EST)</SelectItem>
                  <SelectItem value="PST">Pacific (PST)</SelectItem>
                  <SelectItem value="GMT">Greenwich (GMT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Default Ticket View</Label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tickets</SelectItem>
                  <SelectItem value="my">My Tickets</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Auto-Refresh Interval</Label>
              <Select defaultValue="30">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="0">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save Preferences</Button>
      </div>
    </div>
  );
}
