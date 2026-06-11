import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Lock, Mail, ShieldCheck, Swords, User, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../AuthProvider';
import { useProfile } from '../ProfileProvider';
import {
  acceptInvite,
  lookupInviteByToken,
  type LookupInviteResult,
} from '../../../services/inviteService';
import { gymPath } from '../../tenancy/gymPaths';

function routeAfterInvite(
  accepted: { gymId: string | null },
  fallbackHomeRoute: string,
): string {
  if (accepted.gymId) return gymPath(accepted.gymId, 'dashboard');
  return fallbackHomeRoute;
}

type InviteState =
  | { status: 'loading' }
  | { status: 'invalid'; message: string }
  | { status: 'expired' }
  | { status: 'accepted' }
  | { status: 'ready'; invite: LookupInviteResult };

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { session, signIn, signUp } = useAuth();
  const { refetch, homeRoute } = useProfile();
  const [inviteState, setInviteState] = useState<InviteState>({ status: 'loading' });
  const [submitting, setSubmitting] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) {
        setInviteState({ status: 'invalid', message: 'No invite token provided.' });
        return;
      }
      try {
        const invite = await lookupInviteByToken(token);
        if (cancelled) return;
        if (!invite) {
          setInviteState({ status: 'invalid', message: 'This invite link is no longer valid.' });
          return;
        }
        if (invite.status === 'accepted') {
          setInviteState({ status: 'accepted' });
          return;
        }
        if (invite.status !== 'pending' || new Date(invite.expires_at).getTime() < Date.now()) {
          setInviteState({ status: 'expired' });
          return;
        }
        setInviteState({ status: 'ready', invite });
      } catch (err) {
        if (cancelled) return;
        setInviteState({
          status: 'invalid',
          message: err instanceof Error ? err.message : 'Unable to load invite.',
        });
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const invite = inviteState.status === 'ready' ? inviteState.invite : null;
  const sessionEmail = session?.user.email ?? null;
  const emailMatches = useMemo(() => {
    if (!sessionEmail || !invite) return false;
    return sessionEmail.toLowerCase() === invite.email.toLowerCase();
  }, [sessionEmail, invite]);

  async function handleCreateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!invite) return;
    setError(null);
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get('password') ?? '');
    const fullName = String(formData.get('fullName') ?? invite.full_name ?? '');
    try {
      // Try to sign up; if the account already exists, fall back to sign-in.
      try {
        await signUp(invite.email, password, fullName);
      } catch (err) {
        const message = err instanceof Error ? err.message : '';
        if (/already registered|user already exists|duplicate/i.test(message)) {
          await signIn(invite.email, password);
        } else {
          throw err;
        }
      }
      // After signUp/signIn the auth state will refresh. Profile rehydrate
      // happens through the trigger + onAuthStateChange.
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create your account.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAccept() {
    if (!token) return;
    setError(null);
    setAccepting(true);
    try {
      const accepted = await acceptInvite(token);
      await refetch();
      setSuccess(true);
      const destination = routeAfterInvite(accepted, homeRoute);
      window.setTimeout(() => navigate(destination, { replace: true }), 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to accept invite.');
    } finally {
      setAccepting(false);
    }
  }

  if (inviteState.status === 'loading') {
    return <Shell heading="Checking your invite..." description="Just a moment." />;
  }

  if (inviteState.status === 'invalid') {
    return (
      <Shell heading="Invite not found" description={inviteState.message}>
        <BackToLogin />
      </Shell>
    );
  }

  if (inviteState.status === 'expired') {
    return (
      <Shell
        heading="This invite has expired"
        description="Please ask your platform administrator to send you a new invite."
      >
        <BackToLogin />
      </Shell>
    );
  }

  if (inviteState.status === 'accepted') {
    return (
      <Shell
        heading="Invite already accepted"
        description="This invitation has already been claimed. Sign in to continue."
      >
        <BackToLogin />
      </Shell>
    );
  }

  if (success) {
    return <Navigate to={homeRoute} replace />;
  }

  return (
    <Shell
      heading={
        invite!.gym_name
          ? `Welcome to ${invite!.gym_name}`
          : `Welcome to ${invite!.organization_name}`
      }
      description={
        invite!.gym_name
          ? `You've been invited as ${invite!.role_key.replace(/_/g, ' ')} for this gym.`
          : `You've been invited as ${invite!.role_key.replace(/_/g, ' ')}.`
      }
    >
      <div className="rounded-xl border border-surface-container-high bg-surface p-4 mb-6 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-primary mt-0.5" />
        <div className="text-xs text-on-surface-variant">
          Invite issued to <span className="text-on-surface font-semibold">{invite!.email}</span>.
          You must sign in (or create an account) with this exact email address to accept it.
        </div>
      </div>

      {session && emailMatches ? (
        <div className="space-y-4">
          <button
            type="button"
            disabled={accepting}
            onClick={() => void handleAccept()}
            className="w-full bg-primary-container text-on-primary-fixed text-xs font-bold uppercase tracking-wider py-4 rounded-md hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {accepting ? 'Accepting...' : 'Accept invite'} <ArrowRight className="w-4 h-4" />
          </button>
          {error && (
            <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">{error}</div>
          )}
        </div>
      ) : session && !emailMatches ? (
        <div className="space-y-4">
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            You&apos;re signed in as <span className="font-semibold">{sessionEmail}</span>, but this
            invite is for <span className="font-semibold">{invite!.email}</span>. Sign out and
            return here to claim it.
          </div>
          <BackToLogin />
        </div>
      ) : (
        <form onSubmit={handleCreateAccount} className="space-y-5">
          <Field id="email" label="Email" value={invite!.email} icon={<Mail className="w-4 h-4" />} readOnly />
          <Field
            id="fullName"
            label="Full Name"
            defaultValue={invite!.full_name ?? ''}
            icon={<User className="w-4 h-4" />}
            required
          />
          <Field
            id="password"
            label="Password"
            type="password"
            icon={<Lock className="w-4 h-4" />}
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
          {error && (
            <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">{error}</div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-container text-on-primary-fixed text-xs font-bold uppercase tracking-wider py-4 rounded-md hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : 'Create account & continue'} <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[11px] text-on-surface-variant/80 text-center">
            Already have an AcademyOS account with this email?{' '}
            <Link to="/login" className="text-primary hover:text-primary-fixed font-medium">Sign in</Link> and
            return to this page to accept.
          </p>
        </form>
      )}
    </Shell>
  );
}

function Shell({
  heading,
  description,
  children,
}: {
  heading: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-surface-container-high bg-surface-container-low p-8 shadow-2xl">
        <Link to="/" className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded flex items-center justify-center">
            <Swords className="text-on-primary-container w-6 h-6" />
          </div>
          <span className="text-2xl text-primary tracking-tighter uppercase font-black font-display">
            AcademyOS
          </span>
        </Link>
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-on-surface mb-2">{heading}</h1>
          <p className="text-sm text-on-surface-variant">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function BackToLogin() {
  return (
    <Link
      to="/login"
      className="block text-center w-full bg-surface border border-surface-container-highest text-on-surface text-xs font-bold uppercase tracking-wider py-3 rounded-md hover:bg-surface-container transition-colors inline-flex items-center justify-center gap-2"
    >
      <CheckCircle2 className="w-4 h-4" /> Back to sign in
    </Link>
  );
}

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  icon: React.ReactNode;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  readOnly?: boolean;
  required?: boolean;
  minLength?: number;
};

function Field({ id, label, type = 'text', icon, placeholder, value, defaultValue, readOnly, required, minLength }: FieldProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-on-surface-variant mb-2 block uppercase tracking-wider" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-variant">{icon}</div>
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          readOnly={readOnly}
          required={required}
          minLength={minLength}
          className={`w-full bg-surface border border-surface-container-high rounded-md pl-10 pr-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary ${
            readOnly ? 'opacity-80 cursor-not-allowed' : ''
          }`}
        />
      </div>
    </div>
  );
}
