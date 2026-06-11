import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '../features/auth/AuthProvider';

export default function AccessDenied() {
  const { signOut, session } = useAuth();

  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-surface-container-high bg-surface-container-low p-8 shadow-2xl text-center">
        <div className="w-14 h-14 rounded-xl bg-error-container/30 border border-error/30 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-7 h-7 text-error" />
        </div>
        <h1 className="font-display text-2xl font-bold text-on-surface mb-3">Access Denied</h1>
        <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
          Your account doesn't have a role assigned for this area yet. If you were expecting access,
          please contact your gym administrator or sales team to complete onboarding.
        </p>
        <div className="space-y-3">
          <Link
            to="/contact-sales"
            className="w-full bg-primary-container text-on-primary-fixed text-xs font-bold uppercase tracking-wider py-3 rounded-md hover:brightness-110 transition-all inline-flex items-center justify-center gap-2"
          >
            Contact Sales <ArrowRight className="w-4 h-4" />
          </Link>
          {session ? (
            <button
              type="button"
              onClick={() => void signOut()}
              className="w-full bg-surface border border-surface-container-highest text-on-surface text-xs font-bold uppercase tracking-wider py-3 rounded-md hover:bg-surface-container transition-colors"
            >
              Sign Out
            </button>
          ) : (
            <Link
              to="/login"
              className="w-full bg-surface border border-surface-container-highest text-on-surface text-xs font-bold uppercase tracking-wider py-3 rounded-md hover:bg-surface-container transition-colors inline-flex items-center justify-center"
            >
              Back to Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
