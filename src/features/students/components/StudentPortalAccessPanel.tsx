import { useState } from 'react';
import {
  Ban,
  CheckCircle2,
  Clock,
  Copy,
  FlaskConical,
  KeyRound,
  Mail,
  RefreshCw,
  Send,
  ShieldCheck,
  ShieldOff,
  XCircle,
} from 'lucide-react';
import type { Student } from '../../../services/studentService';
import { buildInviteLink } from '../../../services/studentPortalInviteService';
import { useToast } from '../../../components/Toast';
import {
  useCancelPortalInvite,
  useCreatePortalInvite,
  useCreateTestingPortalLogin,
  useDisablePortalAccess,
  useResendPortalInvite,
  useStudentPortalStatus,
} from '../hooks/useStudents';

type Props = {
  student: Student;
};

const STATUS_LABELS = {
  no_access: { label: 'No portal access', tone: 'neutral' },
  invite_pending: { label: 'Invite pending', tone: 'pending' },
  invite_expired: { label: 'Invite expired', tone: 'warning' },
  invite_cancelled: { label: 'Invite cancelled', tone: 'neutral' },
  enabled: { label: 'Portal enabled', tone: 'success' },
} as const;

const TONE_STYLES: Record<string, string> = {
  neutral: 'bg-surface-container-high text-on-surface-variant border-surface-container-highest',
  pending: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  warning: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
  error: 'bg-red-500/10 text-red-300 border-red-500/30',
};

export default function StudentPortalAccessPanel({ student }: Props) {
  const toast = useToast();
  const statusQuery = useStudentPortalStatus(student.id);
  const createInvite = useCreatePortalInvite();
  const resendInvite = useResendPortalInvite();
  const cancelInvite = useCancelPortalInvite();
  const disableAccess = useDisablePortalAccess();
  const createTestingLogin = useCreateTestingPortalLogin();
  const [email, setEmail] = useState(student.email ?? '');
  const [testPassword, setTestPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const data = statusQuery.data;
  const status = data?.status ?? 'no_access';
  const invite = data?.invite ?? null;
  const enabled = data?.portalAccessEnabled ?? false;
  const statusInfo = STATUS_LABELS[status];

  const inviteLink = invite ? buildInviteLink(invite.invite_token) : null;
  const isWorking =
    createInvite.isPending
    || resendInvite.isPending
    || cancelInvite.isPending
    || disableAccess.isPending
    || createTestingLogin.isPending;

  async function handleCopyLink() {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('Invite link copied', 'Send it to the student to accept the portal invite.');
    } catch {
      toast.error('Copy failed', 'Select and copy the link manually.');
    }
  }

  async function handleInvite() {
    const trimmed = email.trim();
    if (!trimmed) {
      toast.error('Email required', 'Enter the student\'s email before sending an invite.');
      return;
    }
    try {
      await createInvite.mutateAsync({ studentId: student.id, email: trimmed });
      toast.success('Invite created', 'Copy the link from the panel and share it with the student.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create invite.';
      toast.error('Invite failed', message);
    }
  }

  async function handleResend() {
    if (!invite) return;
    try {
      await resendInvite.mutateAsync({ inviteId: invite.id, studentId: student.id });
      toast.success('Invite refreshed', 'A new invite token has been issued.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to resend invite.';
      toast.error('Resend failed', message);
    }
  }

  async function handleCancel() {
    if (!invite) return;
    try {
      await cancelInvite.mutateAsync({ inviteId: invite.id, studentId: student.id });
      toast.success('Invite cancelled');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to cancel invite.';
      toast.error('Cancel failed', message);
    }
  }

  async function handleCreateTestingLogin() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error('Email required', 'Enter the student\'s email before creating a portal login.');
      return;
    }
    if (testPassword && testPassword.length < 8) {
      toast.error('Password too short', 'Temporary password must be at least 8 characters.');
      return;
    }
    setGeneratedPassword(null);
    try {
      const result = await createTestingLogin.mutateAsync({
        studentId: student.id,
        email: trimmedEmail,
        temporaryPassword: testPassword || null,
      });
      if (result.temporaryPassword) {
        setGeneratedPassword(result.temporaryPassword);
        toast.success('Portal login created', 'Copy the generated password before leaving this page.');
      } else {
        toast.success('Portal login created', `The student can sign in with ${result.email}.`);
      }
      setTestPassword('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create portal login.';
      toast.error('Portal login failed', message);
    }
  }

  async function handleCopyGeneratedPassword() {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
      toast.success('Password copied');
    } catch {
      toast.error('Copy failed', 'Select and copy the password manually.');
    }
  }

  async function handleDisable() {
    try {
      await disableAccess.mutateAsync({ studentId: student.id });
      toast.success('Portal access disabled', 'The linked login can no longer access this student.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to disable portal access.';
      toast.error('Disable failed', message);
    }
  }

  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-6 flex flex-col gap-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-display text-lg font-bold text-on-surface mb-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Portal Access
          </h3>
          <p className="text-sm text-on-surface-variant max-w-xl">
            Send the student an invite link so they can sign up and access their own portal. Until
            you invite or enable them, this student has no login.
          </p>
        </div>
        <span
          className={
            'inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border rounded-full px-3 py-1.5 ' +
            TONE_STYLES[statusInfo.tone]
          }
        >
          {statusInfo.label}
        </span>
      </header>

      {statusQuery.isError && (
        <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {statusQuery.error instanceof Error
            ? statusQuery.error.message
            : 'Unable to load portal status.'}
        </div>
      )}

      {invite && (
        <div className="rounded-lg border border-surface-container-high bg-surface p-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">
              Latest invite
            </div>
            <div className="text-xs text-on-surface-variant inline-flex items-center gap-1">
              <Clock className="w-3 h-3" /> Expires {new Date(invite.expires_at).toLocaleDateString()}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1 text-on-surface">
              <Mail className="w-3.5 h-3.5 text-on-surface-variant" /> {invite.email}
            </span>
            <span className="text-on-surface-variant">•</span>
            <span className="text-on-surface uppercase text-xs tracking-widest font-bold">
              {invite.status}
            </span>
            {invite.accepted_at && (
              <>
                <span className="text-on-surface-variant">•</span>
                <span className="text-emerald-300 text-xs inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Accepted{' '}
                  {new Date(invite.accepted_at).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
          {inviteLink && invite.status === 'pending' && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                Invite link
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <code className="flex-1 min-w-0 break-all rounded-md border border-surface-container-high bg-surface-container-low px-3 py-2 text-xs text-on-surface">
                  {inviteLink}
                </code>
                <button
                  type="button"
                  onClick={() => void handleCopyLink()}
                  className="inline-flex items-center gap-2 bg-surface-container border border-surface-container-high text-on-surface text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-md hover:bg-surface-container-high transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {status !== 'enabled' && (
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            Invite email
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="student@example.com"
              className="flex-1 min-w-[220px] bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              disabled={isWorking}
              onClick={() => void handleInvite()}
              className="inline-flex items-center gap-2 bg-primary text-on-primary-fixed text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-md hover:brightness-110 transition-all disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              {invite?.status === 'pending' ? 'Replace invite' : 'Send invite'}
            </button>
          </div>
        </div>
      )}

      {status !== 'enabled' && (
        <div className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-300">
            <FlaskConical className="w-3.5 h-3.5" /> Testing mode
          </div>
          <p className="text-xs text-on-surface-variant">
            Testing mode: creates a portal login directly. Production will use email invite.
            Uses the invite email above; leave the password blank to generate one.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={testPassword}
              onChange={(event) => setTestPassword(event.target.value)}
              placeholder="Temporary password (optional, min 8 chars)"
              className="flex-1 min-w-[220px] bg-surface border border-surface-container-high rounded-md px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              disabled={isWorking}
              onClick={() => void handleCreateTestingLogin()}
              className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-md hover:bg-amber-500/20 transition-colors disabled:opacity-60"
            >
              <KeyRound className="w-3.5 h-3.5" /> Create portal login for testing
            </button>
          </div>
          {generatedPassword && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                Generated password (shown once)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <code className="flex-1 min-w-0 break-all rounded-md border border-surface-container-high bg-surface-container-low px-3 py-2 text-xs text-on-surface">
                  {generatedPassword}
                </code>
                <button
                  type="button"
                  onClick={() => void handleCopyGeneratedPassword()}
                  className="inline-flex items-center gap-2 bg-surface-container border border-surface-container-high text-on-surface text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-md hover:bg-surface-container-high transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {invite?.status === 'pending' && (
          <>
            <button
              type="button"
              disabled={isWorking}
              onClick={() => void handleResend()}
              className="inline-flex items-center gap-2 bg-surface-container border border-surface-container-high text-on-surface text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md hover:bg-surface-container-high transition-colors disabled:opacity-60"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Resend invite
            </button>
            <button
              type="button"
              disabled={isWorking}
              onClick={() => void handleCancel()}
              className="inline-flex items-center gap-2 bg-surface-container border border-surface-container-high text-on-surface text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md hover:bg-surface-container-high transition-colors disabled:opacity-60"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel invite
            </button>
          </>
        )}
        {enabled && (
          <button
            type="button"
            disabled={isWorking}
            onClick={() => void handleDisable()}
            className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-200 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md hover:bg-red-500/20 transition-colors disabled:opacity-60"
          >
            <ShieldOff className="w-3.5 h-3.5" /> Disable portal access
          </button>
        )}
        {!invite && status === 'no_access' && (
          <div className="text-xs text-on-surface-variant inline-flex items-center gap-2">
            <Ban className="w-3.5 h-3.5" /> No invites have been sent for this student yet.
          </div>
        )}
      </div>
    </div>
  );
}
