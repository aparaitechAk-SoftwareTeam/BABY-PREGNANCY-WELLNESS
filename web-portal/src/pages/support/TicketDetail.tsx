import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketApi } from '@/services/ticket.api';
import { SUPPORT_AGENTS, TICKET_PRIORITIES, TICKET_STATUSES } from '@/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TicketStatusBadge, PriorityBadge } from '@/components/support/TicketBadges';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  ArrowLeft, Send, Lock, CheckCircle2, AlertTriangle, User, Mail, Clock, Tag, ArrowUpCircle,
} from 'lucide-react';
import { formatDateTime, timeAgo } from '@/utils/format';
import type { TicketStatus, TicketPriority } from '@/types';
import { cn } from '@/lib/utils';

export function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [replyText, setReplyText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketApi.fetchTicketById(id!),
    enabled: !!id,
  });

  const { data: messages } = useQuery({
    queryKey: ['ticketMessages', id],
    queryFn: () => ticketApi.fetchTicketMessages(id!),
    enabled: !!id,
  });

  const handleSend = async () => {
    if (!replyText.trim() || !ticket) return;
    setSending(true);
    try {
      await ticketApi.sendTicketMessage(ticket.id, replyText, user?.displayName || 'Agent', isInternal);
      setReplyText('');
      setIsInternal(false);
      queryClient.invalidateQueries({ queryKey: ['ticketMessages', id] });
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      toast({ title: isInternal ? 'Internal Note Added' : 'Reply Sent', description: isInternal ? 'Internal note has been added to the ticket.' : 'Your reply has been sent to the user.' });
    } finally {
      setSending(false);
    }
  };

  const handleAssign = async (agentId: string, agentName: string) => {
    if (!ticket) return;
    const result = await ticketApi.assignTicket(ticket.id, agentId, agentName);
    toast({ title: result.success ? 'Ticket Assigned' : 'Action Failed', description: result.message, variant: result.success ? 'default' : 'destructive' });
    queryClient.invalidateQueries({ queryKey: ['ticket', id] });
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!ticket) return;
    const result = await ticketApi.updateTicketStatus(ticket.id, status);
    toast({ title: result.success ? 'Status Updated' : 'Action Failed', description: result.message, variant: result.success ? 'default' : 'destructive' });
    queryClient.invalidateQueries({ queryKey: ['ticket', id] });
  };

  const handlePriorityChange = async (priority: TicketPriority) => {
    if (!ticket) return;
    const result = await ticketApi.updateTicketPriority(ticket.id, priority);
    toast({ title: result.success ? 'Priority Updated' : 'Action Failed', description: result.message });
    queryClient.invalidateQueries({ queryKey: ['ticket', id] });
  };

  const handleEscalate = async () => {
    if (!ticket || !escalateReason.trim()) return;
    const result = await ticketApi.escalateTicket(ticket.id, escalateReason, user?.displayName || 'Agent');
    toast({ title: result.success ? 'Ticket Escalated' : 'Action Failed', description: result.message, variant: result.success ? 'default' : 'destructive' });
    setEscalateOpen(false);
    setEscalateReason('');
    queryClient.invalidateQueries({ queryKey: ['ticket', id] });
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-32" /><Skeleton className="h-96 w-full" /></div>;
  }

  if (!ticket) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Ticket not found.</p>
        <Button variant="outline" onClick={() => navigate('/support-team/tickets')}>Back to Tickets</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/support-team/tickets')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-navy truncate">{ticket.subject}</h2>
            <TicketStatusBadge status={ticket.status} />
            {ticket.escalated && (
              <span className="inline-flex items-center gap-1 rounded-md border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                <AlertTriangle className="h-3 w-3" />
                Escalated
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground font-mono">{ticket.id} - Created {formatDateTime(ticket.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-navy">Conversation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {messages && messages.length > 0 ? (
                messages.map((msg) => {
                  const isUser = msg.authorRole === 'user';
                  const isSystem = msg.authorRole === 'system';
                  const isInternalNote = msg.isInternal;

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center">
                        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">{msg.content}</span>
                      </div>
                    );
                  }

                  if (isInternalNote) {
                    return (
                      <div key={msg.id} className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Lock className="h-3.5 w-3.5 text-amber-600" />
                          <span className="text-xs font-semibold text-amber-700">Internal Note - {msg.author}</span>
                          <span className="text-xs text-amber-600 ml-auto">{formatDateTime(msg.timestamp)}</span>
                        </div>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={cn('flex gap-3', isUser ? 'justify-start' : 'justify-end')}>
                      {!isUser && (
                        <div className="flex-1" />
                      )}
                      <div className={cn('flex gap-3 max-w-[80%]', isUser && 'flex-row')}>
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className={cn('text-xs font-semibold', isUser ? 'bg-navy/10 text-navy' : 'bg-sage/15 text-sage')}>
                            {msg.author.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn('rounded-lg p-3', isUser ? 'bg-muted/50' : 'bg-sage/10 border border-sage/20')}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-navy">{msg.author}</span>
                            <span className="text-xs text-muted-foreground">{timeAgo(msg.timestamp)}</span>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                      {isUser && (
                        <div className="flex-1" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">No messages yet. Start the conversation below.</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-navy">Reply to Ticket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={!isInternal ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsInternal(false)}
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Reply to User
                </Button>
                <Button
                  variant={isInternal ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIsInternal(true)}
                >
                  <Lock className="mr-1.5 h-3.5 w-3.5" />
                  Internal Note
                </Button>
              </div>
              <Textarea
                placeholder={isInternal ? 'Add an internal note (visible only to support team)...' : 'Type your reply to the user...'}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[120px]"
              />
              {isInternal && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-2.5">
                  <p className="flex items-center gap-1.5 text-xs text-amber-700">
                    <Lock className="h-3.5 w-3.5" />
                    This note will only be visible to the support team, not the user.
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Replying as {user?.displayName}</p>
                <Button onClick={handleSend} disabled={sending || !replyText.trim()}>
                  {sending ? 'Sending...' : isInternal ? 'Add Note' : 'Send Reply'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-navy">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Description</Label>
                <p className="text-sm text-foreground rounded-lg bg-muted/30 p-3">{ticket.description}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Reported By</Label>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-navy/10 text-navy text-xs font-semibold">
                      {ticket.user.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-navy">{ticket.user}</p>
                    <p className="text-xs text-muted-foreground">{ticket.userEmail}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Category</Label>
                  <p className="font-medium text-navy capitalize">{ticket.category.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">User ID</Label>
                  <p className="font-mono text-xs text-muted-foreground">{ticket.userId}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Created</Label>
                  <p className="text-xs text-navy">{formatDateTime(ticket.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Updated</Label>
                  <p className="text-xs text-navy">{timeAgo(ticket.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-navy">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Assigned Agent</Label>
                <Select
                  value={ticket.assignedAgentId || 'unassigned'}
                  onValueChange={(v) => {
                    const agent = SUPPORT_AGENTS.find((a) => a.id === v);
                    if (agent) handleAssign(agent.id, agent.name);
                  }}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {SUPPORT_AGENTS.map((a) => (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={ticket.status} onValueChange={(v) => handleStatusChange(v as TicketStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TICKET_STATUSES.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <Select value={ticket.priority} onValueChange={(v) => handlePriorityChange(v as TicketPriority)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TICKET_PRIORITIES.map((p) => (<SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full text-sage hover:text-sage"
                  onClick={() => handleStatusChange('resolved')}
                  disabled={ticket.status === 'resolved'}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Resolved
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => setEscalateOpen(true)}
                  disabled={ticket.escalated}
                >
                  <ArrowUpCircle className="mr-2 h-4 w-4" />
                  Escalate Ticket
                </Button>
              </div>
            </CardContent>
          </Card>

          {ticket.escalated && ticket.escalationReason && (
            <Card className="border-destructive/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">Escalation Reason</p>
                    <p className="text-xs text-muted-foreground mt-1">{ticket.escalationReason}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={escalateOpen} onOpenChange={setEscalateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Escalate Ticket</DialogTitle>
            <DialogDescription>
              Escalating this ticket will mark it as escalated and notify the admin team for review. This action should be used for issues that require administrative or engineering attention.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="escalate-reason">Escalation Reason</Label>
            <Textarea
              id="escalate-reason"
              placeholder="Explain why this ticket needs to be escalated..."
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalateOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleEscalate} disabled={!escalateReason.trim()}>
              Confirm Escalation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
