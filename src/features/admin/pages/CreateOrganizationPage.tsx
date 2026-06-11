import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Copy } from 'lucide-react';
import CreateOrganizationForm from '../components/CreateOrganizationForm';
import type { CreateOrganizationResult } from '../services/adminService';

export default function CreateOrganizationPage() {
  const navigate = useNavigate();
  const [result, setResult] = useState<CreateOrganizationResult | null>(null);

  const inviteLink = result?.inviteToken
    ? `${window.location.origin}/signup/invite/${result.inviteToken}`
    : null;

  return (
    <div className="p-8 flex flex-col gap-6 max-w-3xl w-full mx-auto">
      <Link
        to="/admin/organizations"
        className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors inline-flex items-center gap-1.5 w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to organizations
      </Link>

      <div>
        <h1 className="font-display text-3xl font-bold text-on-surface">Create Organization</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Provision a new gym network, its primary location, and an owner invite. The owner
          accepts the invite to claim their account; auth users are created server-side by the
          Edge Function (or manually for development).
        </p>
      </div>

      {result ? (
        <div className="rounded-2xl border border-primary/40 bg-primary/5 p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container/30 border border-primary/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-on-surface">Organization created</h2>
              <p className="text-xs text-on-surface-variant">
                Organization id: <span className="font-mono">{result.organizationId}</span>
              </p>
            </div>
          </div>

          {inviteLink && (
            <div className="rounded-xl border border-surface-container-high bg-surface p-5 space-y-3">
              <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
                Owner Invite Link
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="text-xs text-on-surface font-mono break-all flex-1 min-w-0">
                  {inviteLink}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(inviteLink);
                  }}
                  className="inline-flex items-center gap-1.5 bg-surface-container border border-surface-container-highest text-xs font-bold uppercase tracking-wider text-on-surface px-3 py-2 rounded hover:bg-surface-container-high transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant">
                Share this link with the owner. They can finish account setup at
                <span className="font-mono"> /signup/invite/&lt;token&gt;</span>.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(`/admin/organizations/${result.organizationId}`)}
              className="bg-primary-container text-on-primary-fixed text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-md hover:brightness-110 transition-all"
            >
              Open organization
            </button>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="bg-surface border border-surface-container-highest text-on-surface text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-md hover:bg-surface-container transition-colors"
            >
              Create another
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-surface-container-high bg-surface-container-low p-8">
          <CreateOrganizationForm onSuccess={setResult} />
        </div>
      )}
    </div>
  );
}
