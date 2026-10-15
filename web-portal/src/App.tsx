import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RoleGuard } from '@/routes/RoleGuard';
import { AdminLayout } from '@/layouts/AdminLayout';
import { SupportLayout } from '@/layouts/SupportLayout';
import { Toaster } from '@/components/ui/toaster';

import { Login } from '@/pages/auth/Login';
import { ForgotPassword } from '@/pages/auth/ForgotPassword';
import { DashboardOverview } from '@/pages/dashboard/DashboardOverview';
import { UsersList } from '@/pages/users/UsersList';
import { UserDetails } from '@/pages/users/UserDetails';
import { ContentList } from '@/pages/content/ContentList';
import { ContentEditor } from '@/pages/content/ContentEditor';
import { ContentPreview } from '@/pages/content/ContentPreview';
import { FAQList } from '@/pages/faqs/FAQList';
import { FAQEditor } from '@/pages/faqs/FAQEditor';
import { AnnouncementList } from '@/pages/announcements/AnnouncementList';
import { AnnouncementEditor } from '@/pages/announcements/AnnouncementEditor';
import { NotificationList } from '@/pages/notifications/NotificationList';
import { NotificationEditor } from '@/pages/notifications/NotificationEditor';
import { SubscriptionOverview } from '@/pages/subscriptions/SubscriptionOverview';
import { SupportOverview } from '@/pages/support/SupportOverview';
import { AuditLogs } from '@/pages/audit/AuditLogs';
import { RoleManagement } from '@/pages/roles/RoleManagement';
import { AdminSettings } from '@/pages/settings/AdminSettings';

import { SupportDashboard } from '@/pages/support/SupportDashboard';
import { TicketListPage } from '@/pages/support/TicketListPage';
import { TicketDetail } from '@/pages/support/TicketDetail';
import { Escalations } from '@/pages/support/Escalations';
import { UserLookup } from '@/pages/support/UserLookup';
import { HelpCenter } from '@/pages/support/HelpCenter';
import { SupportNotifications } from '@/pages/support/SupportNotifications';
import { SupportProfile } from '@/pages/support/SupportProfile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function RoleBasedRedirect({ to }: { to: string }) {
  return <Navigate to={to} replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Admin Console */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardOverview />} />
              <Route path="users" element={<UsersList />} />
              <Route path="users/:id" element={<UserDetails />} />
              <Route path="content" element={<ContentList />} />
              <Route path="content/week-by-week" element={<ContentList />} />
              <Route path="content/new" element={<ContentEditor />} />
              <Route path="content/:id" element={<ContentEditor />} />
              <Route path="content/:id/preview" element={<ContentPreview />} />
              <Route path="faqs" element={<FAQList />} />
              <Route path="faqs/new" element={<FAQEditor />} />
              <Route path="faqs/:id" element={<FAQEditor />} />
              <Route path="announcements" element={<AnnouncementList />} />
              <Route path="announcements/new" element={<AnnouncementEditor />} />
              <Route path="announcements/:id" element={<AnnouncementEditor />} />
              <Route path="notifications" element={<NotificationList />} />
              <Route path="notifications/new" element={<NotificationEditor />} />
              <Route path="subscriptions" element={<SubscriptionOverview />} />
              <Route path="support" element={<SupportOverview />} />
              <Route path="support/team" element={<SupportOverview />} />
              <Route
                path="audit"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <AuditLogs />
                  </RoleGuard>
                }
              />
              <Route
                path="roles"
                element={
                  <RoleGuard allowedRoles={['admin']}>
                    <RoleManagement />
                  </RoleGuard>
                }
              />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Support Team Console */}
            <Route
              path="/support-team"
              element={
                <ProtectedRoute>
                  <SupportLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<SupportDashboard />} />
              <Route path="tickets" element={<TicketListPage mode="all" title="All Tickets" description="Browse and manage all support tickets" />} />
              <Route path="my-tickets" element={<TicketListPage mode="my" title="My Tickets" description="Tickets assigned to you" />} />
              <Route path="unassigned" element={<TicketListPage mode="unassigned" title="Unassigned Tickets" description="Tickets waiting to be assigned to an agent" />} />
              <Route path="tickets/:id" element={<TicketDetail />} />
              <Route path="escalations" element={<Escalations />} />
              <Route path="user-lookup" element={<UserLookup />} />
              <Route path="help-center" element={<HelpCenter />} />
              <Route path="notifications" element={<SupportNotifications />} />
              <Route path="profile" element={<SupportProfile />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
