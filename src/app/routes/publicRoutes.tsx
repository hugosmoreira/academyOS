import { Navigate, Route } from 'react-router-dom';
import LandingPage from '../../pages/LandingPage';
import Login from '../../pages/Login';
import ContactSales from '../../pages/ContactSales';
import AccessDenied from '../../pages/AccessDenied';
import TrialBooking from '../../pages/TrialBooking';
import ForgotPassword from '../../features/auth/pages/ForgotPassword';
import AcceptInvite from '../../features/auth/pages/AcceptInvite';
import AcceptStudentPortalInvite from '../../features/portals/pages/AcceptStudentPortalInvite';
import { GuestRoute, RoleBasedRedirect } from '../guards';

/**
 * Public routes available without authentication. Notably:
 *   - /signup is closed; we redirect to /contact-sales.
 *   - /book-demo is an alias for /contact-sales.
 *   - /post-login is the internal redirect target after login.
 */
export function publicRoutes() {
  return (
    <>
      <Route path="/" element={<LandingPage />} />
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route path="/signup" element={<Navigate to="/contact-sales" replace />} />
      <Route path="/signup/invite/:token" element={<AcceptInvite />} />
      <Route path="/portal/accept-invite/:token" element={<AcceptStudentPortalInvite />} />
      <Route path="/contact-sales" element={<ContactSales />} />
      <Route path="/book-demo" element={<Navigate to="/contact-sales" replace />} />
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="/post-login" element={<RoleBasedRedirect />} />
      <Route path="/trial" element={<TrialBooking />} />
      <Route path="/trial/:gymSlug" element={<TrialBooking />} />
    </>
  );
}
