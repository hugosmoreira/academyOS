import { Navigate, Route } from 'react-router-dom';
import PortalLayout from '../../layouts/PortalLayout';
import PortalDashboard from '../../features/portals/pages/PortalDashboard';
import PortalClassesPage from '../../features/portals/pages/PortalClassesPage';
import PortalSchedulePage from '../../features/portals/pages/PortalSchedulePage';
import PortalAttendancePage from '../../features/portals/pages/PortalAttendancePage';
import PortalProgressPage from '../../features/portals/pages/PortalProgressPage';
import PortalProfilePage from '../../features/portals/pages/PortalProfilePage';
import PortalBillingPage from '../../features/portals/pages/PortalBillingPage';
import PortalWaiversPage from '../../features/portals/pages/PortalWaiversPage';
import { PortalRoute } from '../guards';

/** Student / parent portal at /portal/*. */
export function portalRoutes() {
  return (
    <Route element={<PortalRoute />}>
      <Route path="/portal" element={<PortalLayout />}>
        <Route index element={<Navigate to="/portal/dashboard" replace />} />
        <Route path="dashboard" element={<PortalDashboard />} />
        <Route path="schedule" element={<PortalSchedulePage />} />
        <Route path="classes" element={<PortalClassesPage />} />
        <Route path="attendance" element={<PortalAttendancePage />} />
        <Route path="progress" element={<PortalProgressPage />} />
        <Route path="profile" element={<PortalProfilePage />} />
        <Route path="billing" element={<PortalBillingPage />} />
        <Route path="waivers" element={<PortalWaiversPage />} />
        <Route path="*" element={<Navigate to="/portal/dashboard" replace />} />
      </Route>
    </Route>
  );
}
