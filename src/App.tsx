import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import People from './pages/People';
import Programs from './pages/Programs';
import TrialBooking from './pages/TrialBooking';
import LeadsPipeline from './pages/LeadsPipeline';
import LeadDetail from './pages/LeadDetail';
import FamilyProfile from './pages/FamilyProfile';
import AttendanceReports from './pages/AttendanceReports';
import ClassRoster from './pages/ClassRoster';
import Instructors from './pages/Instructors';
import InstructorProfile from './pages/InstructorProfile';
import Promotions from './pages/Promotions';
import MembershipPlans from './pages/MembershipPlans';
import CollectionsDashboard from './pages/CollectionsDashboard';
import InvoiceDetail from './pages/InvoiceDetail';
import FamilyOverview from './pages/FamilyOverview';
import EventsAndSeminars from './pages/EventsAndSeminars';
import AppLayout from './layouts/AppLayout';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/trial" element={<TrialBooking />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<People />} />
          <Route path="programs" element={<Programs />} />
          <Route path="leads" element={<LeadsPipeline />} />
          <Route path="leads/:id" element={<LeadDetail />} />
          <Route path="families/:id" element={<FamilyProfile />} />
          <Route path="attendance" element={<AttendanceReports />} />
          <Route path="attendance/:classId" element={<ClassRoster />} />
          <Route path="instructors" element={<Instructors />} />
          <Route path="instructors/:id" element={<InstructorProfile />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="plans" element={<MembershipPlans />} />
          <Route path="collections" element={<CollectionsDashboard />} />
          <Route path="invoices/:id" element={<InvoiceDetail />} />
          <Route path="family" element={<FamilyOverview />} />
          <Route path="events" element={<EventsAndSeminars />} />
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
