import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Settings as SettingsIcon, User, Bell, Shield, Globe, Save } from 'lucide-react';

export function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({ email: true, push: false, weekly: true });
  const [theme, setTheme] = useState('light');
  const [timezone, setTimezone] = useState('UTC');

  const handleSave = () => {
    toast({ title: 'Settings Saved', description: 'Your settings have been updated successfully.' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-navy flex items-center gap-2"><User className="h-4 w-4" />Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-3 pb-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/15 text-primary text-xl font-semibold">
                  {user?.displayName?.split(' ').map((n) => n[0]).join('') || 'AD'}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-semibold text-navy">{user?.displayName}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                <Badge variant="secondary" className="mt-1 capitalize">{user?.role.replace('_', ' ')}</Badge>
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
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-navy flex items-center gap-2"><Bell className="h-4 w-4" />Notifications</CardTitle>
            <CardDescription>Manage notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div>
                <p className="text-sm font-medium text-navy">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive alerts via email</p>
              </div>
              <Switch checked={notifications.email} onCheckedChange={(v) => setNotifications({ ...notifications, email: v })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div>
                <p className="text-sm font-medium text-navy">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Receive alerts in browser</p>
              </div>
              <Switch checked={notifications.push} onCheckedChange={(v) => setNotifications({ ...notifications, push: v })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div>
                <p className="text-sm font-medium text-navy">Weekly Summary</p>
                <p className="text-xs text-muted-foreground">Weekly activity digest</p>
              </div>
              <Switch checked={notifications.weekly} onCheckedChange={(v) => setNotifications({ ...notifications, weekly: v })} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-navy flex items-center gap-2"><Globe className="h-4 w-4" />Preferences</CardTitle>
            <CardDescription>Application preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              <Label>Default Page Size</Label>
              <Select defaultValue="10">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 items</SelectItem>
                  <SelectItem value="20">20 items</SelectItem>
                  <SelectItem value="50">50 items</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-navy flex items-center gap-2"><Shield className="h-4 w-4" />Security</CardTitle>
          <CardDescription>Account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
            <div>
              <p className="text-sm font-medium text-navy">Change Password</p>
              <p className="text-xs text-muted-foreground">Update your password regularly for security</p>
            </div>
            <Button variant="outline" size="sm">Change Password</Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
            <div>
              <p className="text-sm font-medium text-navy">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Button variant="outline" size="sm">Enable 2FA</Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
            <div>
              <p className="text-sm font-medium text-navy">Active Sessions</p>
              <p className="text-xs text-muted-foreground">Manage your active login sessions</p>
            </div>
            <Button variant="outline" size="sm">View Sessions</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save All Settings</Button>
      </div>
    </div>
  );
}
