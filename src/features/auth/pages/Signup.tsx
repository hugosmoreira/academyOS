import { Navigate } from 'react-router-dom';

/**
 * Public, self-service signup has been retired. AcademyOS is provisioned
 * by the platform team — owners and staff arrive via signed invites
 * (see /signup/invite/:token, added in Phase 7). This component remains
 * as a safety net for any external links that still point to /signup.
 */
export default function Signup() {
  return <Navigate to="/contact-sales" replace />;
}
