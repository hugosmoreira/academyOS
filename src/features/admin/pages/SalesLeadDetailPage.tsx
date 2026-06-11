import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Inbox,
  Mail,
  Phone,
  XCircle,
} from 'lucide-react';
import {
  useConvertSalesLead,
  useSalesLead,
  useUpdateSalesLeadStatus,
} from '../hooks/useSalesLeads';
import type { SalesLeadStatus } from '../../../types/database';

const STATUS_BUTTONS: Array<{ status: SalesLeadStatus; label: string }> = [
  { status: 'new', label: 'New' },
  { status: 'contacted', label: 'Mark Contacted' },
  { status: 'demo_scheduled', label: 'Demo Scheduled' },
  { status: 'lost', label: 'Mark Lost' },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export default function SalesLeadDetailPage() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const leadQuery = useSalesLead(leadId);
  const updateStatus = useUpdateSalesLeadStatus();
  const convertLead = useConvertSalesLead();

  const [showConvert, setShowConvert] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [gymName, setGymName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerFullName, setOwnerFullName] = useState('');
  const [conversionResult, setConversionResult] = useState<{
    inviteToken: string | null;
    organizationId: string;
  } | null>(null);

  const lead = leadQuery.data;

  function openConvertModal() {
    if (!lead) return;
    setOrgName(lead.academy_name ?? '');
    setGymName(lead.academy_name ? `${lead.academy_name} HQ` : '');
    setOwnerEmail(lead.email);
    setOwnerFullName(lead.full_name);
    setShowConvert(true);
  }

  async function onConvert() {
    if (!lead) return;
    try {
      const result = await convertLead.mutateAsync({
        leadId: lead.id,
        orgName: orgName.trim(),
        orgSlug: slugify(orgName),
        gymName: gymName.trim(),
        gymSlug: slugify(gymName),
        ownerEmail: ownerEmail.trim() || null,
        ownerFullName: ownerFullName.trim() || null,
      });
      setConversionResult({
        inviteToken: result.inviteToken,
        organizationId: result.organizationId,
      });
    } catch {
      // error is surfaced via mutation.error below
    }
  }

  if (leadQuery.isLoading) {
    return <div className="p-8 text-sm text-on-surface-variant">Loading lead...</div>;
  }

  if (!lead) {
    return (
      <div className="p-8 max-w-2xl">
        <Link
          to="/admin/sales-leads"
          className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to sales leads
        </Link>
        <div className="mt-6 rounded-xl border border-error/30 bg-error-container/10 p-6 text-sm text-error">
          Sales lead not found.
        </div>
      </div>
    );
  }

  const inviteLink = conversionResult?.inviteToken
    ? `${window.location.origin}/signup/invite/${conversionResult.inviteToken}`
    : null;

  return (
    <div className="p-8 flex flex-col gap-6 max-w-[1000px] w-full mx-auto">
      <Link
        to="/admin/sales-leads"
        className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1.5 w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to sales leads
      </Link>

      <header className="flex flex-col gap-3 border-b border-surface-container-high pb-6">
        <div className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold flex items-center gap-1.5">
          <Inbox className="w-3 h-3 text-primary" /> Sales Lead
        </div>
        <h1 className="font-display text-3xl font-bold text-on-surface">{lead.full_name}</h1>
        <div className="flex items-center gap-3 text-xs text-on-surface-variant">
          <span>{new Date(lead.created_at).toLocaleString()}</span>
          <span className="w-1 h-1 rounded-full bg-on-surface-variant/50" />
          <span className="uppercase tracking-widest font-bold">{lead.status}</span>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem icon={<Mail className="w-4 h-4" />} label="Email" value={lead.email} />
        <DetailItem icon={<Phone className="w-4 h-4" />} label="Phone" value={lead.phone ?? '—'} />
        <DetailItem
          icon={<Building2 className="w-4 h-4" />}
          label="Academy"
          value={lead.academy_name ?? '—'}
        />
        <DetailItem
          icon={<Inbox className="w-4 h-4" />}
          label="Source"
          value={lead.source}
        />
      </section>

      {lead.message && (
        <section className="rounded-xl border border-surface-container-high bg-surface-container-low p-5">
          <div className="text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-bold mb-2">
            Message
          </div>
          <p className="text-sm text-on-surface whitespace-pre-line">{lead.message}</p>
        </section>
      )}

      <section className="rounded-xl border border-surface-container-high bg-surface-container-low p-5 flex flex-col gap-4">
        <div className="text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-bold">
          Update Status
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_BUTTONS.map((b) => (
            <button
              key={b.status}
              type="button"
              onClick={() => updateStatus.mutate({ id: lead.id, status: b.status })}
              disabled={updateStatus.isPending || lead.status === b.status || lead.status === 'converted'}
              className={
                'px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ' +
                (lead.status === b.status
                  ? 'bg-primary text-on-primary-fixed'
                  : 'bg-background text-on-surface-variant hover:text-on-surface border border-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed')
              }
            >
              {b.label}
            </button>
          ))}
        </div>
        {updateStatus.error && (
          <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
            {updateStatus.error instanceof Error
              ? updateStatus.error.message
              : 'Could not update status.'}
          </div>
        )}
      </section>

      {lead.status !== 'converted' ? (
        <section className="rounded-xl border border-primary/30 bg-primary-container/10 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-on-surface flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Convert to Organization
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Create the org, first gym, and invite this lead as the owner.
            </p>
          </div>
          <button
            type="button"
            onClick={openConvertModal}
            className="inline-flex items-center gap-2 bg-primary text-on-primary-fixed text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-md hover:brightness-110 transition-all"
          >
            Convert lead <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      ) : (
        <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 flex items-center gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="text-on-surface">Lead has been converted.</span>
          {lead.converted_organization_id && (
            <Link
              to={`/admin/organizations/${lead.converted_organization_id}`}
              className="ml-auto text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-fixed inline-flex items-center gap-1.5"
            >
              View organization <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </section>
      )}

      {showConvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-surface-container-high bg-surface-container-low p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-on-surface">Convert lead</h2>
              <button
                type="button"
                onClick={() => {
                  setShowConvert(false);
                  setConversionResult(null);
                }}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {conversionResult ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-on-surface">
                  Organization created. Share the invite link below with the owner.
                </div>
                {inviteLink && (
                  <div className="bg-background rounded p-3 font-mono text-xs text-on-surface break-all">
                    {inviteLink}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/organizations/${conversionResult.organizationId}`)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-on-primary-fixed text-xs font-bold uppercase tracking-wider px-4 py-3 rounded-md hover:brightness-110"
                  >
                    Open organization <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConvert(false);
                      setConversionResult(null);
                    }}
                    className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface border border-surface-container-high rounded-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void onConvert();
                }}
              >
                <FormField
                  label="Organization name"
                  value={orgName}
                  onChange={setOrgName}
                  required
                />
                <FormField
                  label="First gym name"
                  value={gymName}
                  onChange={setGymName}
                  required
                />
                <FormField
                  label="Owner full name"
                  value={ownerFullName}
                  onChange={setOwnerFullName}
                />
                <FormField
                  label="Owner email"
                  type="email"
                  value={ownerEmail}
                  onChange={setOwnerEmail}
                  required
                />
                {convertLead.error && (
                  <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
                    {convertLead.error instanceof Error
                      ? convertLead.error.message
                      : 'Conversion failed.'}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={convertLead.isPending || !orgName.trim() || !gymName.trim() || !ownerEmail.trim()}
                  className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary-fixed text-xs font-bold uppercase tracking-wider px-4 py-3 rounded-md hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {convertLead.isPending ? 'Converting...' : 'Create organization'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type DetailItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="rounded-xl border border-surface-container-high bg-surface-container-low p-4">
      <div className="text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-bold flex items-center gap-1.5 mb-1.5">
        {icon}
        {label}
      </div>
      <div className="text-sm text-on-surface">{value}</div>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
};

function FormField({ label, value, onChange, type = 'text', required }: FormFieldProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-on-surface-variant mb-2 block uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full bg-background border border-surface-container-high rounded-md px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
