import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/tables/DataTableCard';
import { useToast } from '@/hooks/use-toast';
import { Search, UserCircle, Mail, Calendar, CreditCard, ArrowRight, Ticket as TicketIcon } from 'lucide-react';
import { mockSupportTickets } from '@/mocks/support.mock';
import { mockUsers } from '@/mocks/users.mock';
import { formatDate, formatDateTime } from '@/utils/format';

export function UserLookup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<typeof mockUsers>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const q = search.toLowerCase().trim();
    if (!q) {
      setResults([]);
      return;
    }
    const found = mockUsers.filter(
      (u) => u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q),
    );
    setResults(found);
    if (found.length === 0) {
      toast({ title: 'No users found', description: 'No users match your search criteria.' });
    }
  };

  const getUserTickets = (userId: string) => mockSupportTickets.filter((t) => t.userId === userId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-navy">User Lookup</h2>
        <p className="text-sm text-muted-foreground">Search for users by ID, email, or name to assist with account troubleshooting</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Enter user ID, email, or name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </CardContent>
      </Card>

      {searched && results.length > 0 && (
        <div className="space-y-4">
          {results.slice(0, 5).map((user) => {
            const userTickets = getUserTickets(user.id);
            return (
              <Card key={user.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-navy">User Account</CardTitle>
                    <StatusBadge status={user.accountStatus} />
                  </div>
                  <CardDescription>Limited account information for troubleshooting purposes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary/15 text-primary text-lg font-semibold">
                        {user.displayName.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-navy">{user.displayName}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={user.accountStatus} />
                        <StatusBadge status={user.subscriptionStatus} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy/10"><UserCircle className="h-4 w-4 text-navy" /></div>
                      <div><p className="text-xs text-muted-foreground">User ID</p><p className="font-mono text-sm font-medium text-navy">{user.id}</p></div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"><Mail className="h-4 w-4 text-primary" /></div>
                      <div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium text-navy truncate">{user.email}</p></div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage/15"><Calendar className="h-4 w-4 text-sage" /></div>
                      <div><p className="text-xs text-muted-foreground">Registered</p><p className="text-sm font-medium text-navy">{formatDate(user.registrationDate)}</p></div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blush/20"><CreditCard className="h-4 w-4 text-blush-dark" /></div>
                      <div><p className="text-xs text-muted-foreground">Plan</p><p className="text-sm font-medium text-navy">{user.subscriptionPlan || 'N/A'}</p></div>
                    </div>
                  </div>

                  {userTickets.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-navy mb-2">Support Tickets ({userTickets.length})</p>
                        <div className="space-y-2">
                          {userTickets.map((ticket) => (
                            <div
                              key={ticket.id}
                              className="flex cursor-pointer items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/30"
                              onClick={() => navigate(`/support-team/tickets/${ticket.id}`)}
                            >
                              <div className="flex items-center gap-3">
                                <TicketIcon className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium text-navy">{ticket.subject}</p>
                                  <p className="text-xs text-muted-foreground">{ticket.id} - {formatDateTime(ticket.createdAt)}</p>
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                    <p className="text-xs text-amber-800">
                      <strong>Privacy Notice:</strong> This view shows only permitted account information for troubleshooting. Private health data including symptoms, mood entries, personal notes, and movement records are not accessible.
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {searched && results.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <UserCircle className="h-8 w-8" />
              <p>No users found matching "{search}"</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
