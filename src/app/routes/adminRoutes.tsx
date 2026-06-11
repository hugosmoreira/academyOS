import { Navigate, Route } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import AdminDashboard from '../../features/admin/pages/AdminDashboard';
import OrganizationsListPage from '../../features/admin/pages/OrganizationsListPage';
import CreateOrganizationPage from '../../features/admin/pages/CreateOrganizationPage';
import OrganizationDetailPage from '../../features/admin/pages/OrganizationDetailPage';
import OrganizationEditPage from '../../features/admin/pages/OrganizationEditPage';
import GymsListPage from '../../features/admin/pages/GymsListPage';
import CreateGymPage from '../../features/admin/pages/CreateGymPage';
import GymDetailPage from '../../features/admin/pages/GymDetailPage';
import GymEditPage from '../../features/admin/pages/GymEditPage';
import UsersListPage from '../../features/admin/pages/UsersListPage';
import UserDetailPage from '../../features/admin/pages/UserDetailPage';
import SalesLeadsListPage from '../../features/admin/pages/SalesLeadsListPage';
import SalesLeadDetailPage from '../../features/admin/pages/SalesLeadDetailPage';
import AdminSettingsPage from '../../features/admin/pages/AdminSettingsPage';
import { AdminRoute } from '../guards';

/** Platform super admin area at /admin/*. */
export function adminRoutes() {
  return (
    <Route element={<AdminRoute />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<Navigate to="/admin" replace />} />
        <Route path="sales-leads" element={<SalesLeadsListPage />} />
        <Route path="sales-leads/:leadId" element={<SalesLeadDetailPage />} />
        <Route path="organizations" element={<OrganizationsListPage />} />
        <Route path="organizations/new" element={<CreateOrganizationPage />} />
        <Route path="organizations/:orgId" element={<OrganizationDetailPage />} />
        <Route path="organizations/:orgId/edit" element={<OrganizationEditPage />} />
        <Route path="gyms" element={<GymsListPage />} />
        <Route path="gyms/new" element={<CreateGymPage />} />
        <Route path="gyms/:gymId" element={<GymDetailPage />} />
        <Route path="gyms/:gymId/edit" element={<GymEditPage />} />
        <Route path="users" element={<UsersListPage />} />
        <Route path="users/:userId" element={<UserDetailPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Route>
  );
}
