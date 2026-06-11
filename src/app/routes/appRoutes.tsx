import { Navigate, Route } from 'react-router-dom';
import AppLayout from '../../layouts/AppLayout';
import Dashboard from '../../pages/Dashboard';
import Programs from '../../pages/Programs';
import LeadsPipeline from '../../pages/LeadsPipeline';
import LeadDetail from '../../pages/LeadDetail';
import FamilyProfile from '../../pages/FamilyProfile';
import AttendanceReports from '../../pages/AttendanceReports';
import ClassRoster from '../../pages/ClassRoster';
import Instructors from '../../pages/Instructors';
import InstructorProfile from '../../pages/InstructorProfile';
import Promotions from '../../pages/Promotions';
import MembershipPlans from '../../pages/MembershipPlans';
import CollectionsDashboard from '../../pages/CollectionsDashboard';
import InvoiceDetail from '../../pages/InvoiceDetail';
import EventsAndSeminars from '../../pages/EventsAndSeminars';
import MessagingPage from '../../features/messaging/pages/MessagingPage';
import SettingsPage from '../../features/settings/pages/SettingsPage';
import WaiversPage from '../../features/waivers/pages/WaiversPage';
import KioskPage from '../../features/attendance/pages/KioskPage';
import KioskRedirect from '../../features/attendance/pages/KioskRedirect';
import GymSelectorPage from '../../features/tenancy/pages/GymSelectorPage';
import {
  StudentsListPage,
  StudentCreatePage,
  StudentProfilePage,
} from '../../features/students';
import AppGymRedirect, { AppGymLegacyRedirect } from '../guards/AppGymRedirect';
import { AppRoute, AppHomeRedirect, GymRoute } from '../guards';

/**
 * Gym operator routes at /app/*.
 * Canonical paths live under /app/gyms/:gymId/*; flat legacy paths redirect.
 */
export function appRoutes() {
  return (
    <Route element={<AppRoute />}>
      <Route path="/app" element={<AppLayout />}>
        <Route index element={<AppHomeRedirect />} />
        <Route path="gym-selector" element={<GymSelectorPage />} />

        <Route path="gyms/:gymId" element={<GymRoute />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<StudentsListPage />} />
          <Route path="students/new" element={<StudentCreatePage />} />
          <Route path="students/:studentId" element={<StudentProfilePage />} />
          <Route path="programs" element={<Programs />} />
          <Route path="classes" element={<Navigate to="../programs" replace />} />
          <Route path="staff" element={<Instructors />} />
          <Route path="staff/:id" element={<InstructorProfile />} />
          <Route path="instructors" element={<Navigate to="../staff" replace />} />
          <Route path="leads" element={<LeadsPipeline />} />
          <Route path="leads/:id" element={<LeadDetail />} />
          <Route path="families/:id" element={<FamilyProfile />} />
          <Route path="attendance" element={<AttendanceReports />} />
          <Route path="attendance/:classId" element={<ClassRoster />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="plans" element={<MembershipPlans />} />
          <Route path="billing" element={<CollectionsDashboard />} />
          <Route path="collections" element={<Navigate to="../billing" replace />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="events" element={<EventsAndSeminars />} />
          <Route path="messaging" element={<MessagingPage />} />
          <Route path="waivers" element={<WaiversPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="reports" element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="dashboard" element={<AppGymRedirect segment="dashboard" />} />
        <Route path="students" element={<AppGymRedirect segment="students" />} />
        <Route path="students/new" element={<AppGymRedirect segment="students/new" />} />
        <Route path="students/:studentId" element={<AppGymLegacyRedirect />} />
        <Route path="programs" element={<AppGymRedirect segment="programs" />} />
        <Route path="classes" element={<AppGymRedirect segment="programs" />} />
        <Route path="leads" element={<AppGymRedirect segment="leads" />} />
        <Route path="leads/:id" element={<AppGymLegacyRedirect />} />
        <Route path="families" element={<AppGymRedirect segment="students" />} />
        <Route path="families/:id" element={<AppGymLegacyRedirect />} />
        <Route path="attendance" element={<AppGymRedirect segment="attendance" />} />
        <Route path="attendance/:classId" element={<AppGymLegacyRedirect />} />
        <Route path="staff" element={<AppGymRedirect segment="staff" />} />
        <Route path="instructors" element={<AppGymRedirect segment="staff" />} />
        <Route path="instructors/:id" element={<AppGymLegacyRedirect />} />
        <Route path="promotions" element={<AppGymRedirect segment="promotions" />} />
        <Route path="billing" element={<AppGymRedirect segment="plans" />} />
        <Route path="plans" element={<AppGymRedirect segment="plans" />} />
        <Route path="collections" element={<AppGymRedirect segment="billing" />} />
        <Route path="invoices/:id" element={<AppGymLegacyRedirect />} />
        <Route path="events" element={<AppGymRedirect segment="events" />} />
        <Route path="messaging" element={<AppGymRedirect segment="messaging" />} />
        <Route path="waivers" element={<AppGymRedirect segment="waivers" />} />
        <Route path="settings" element={<AppGymRedirect segment="settings" />} />
        <Route path="reports" element={<AppGymRedirect segment="dashboard" />} />
        <Route path="gyms" element={<Navigate to="/app/gym-selector" replace />} />
        <Route path="kiosk" element={<KioskRedirect />} />
        <Route path="kiosk-legacy" element={<KioskPage />} />
        <Route path="family" element={<Navigate to="/portal/dashboard" replace />} />
        <Route path="*" element={<AppHomeRedirect />} />
      </Route>
    </Route>
  );
}
