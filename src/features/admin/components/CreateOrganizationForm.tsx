import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, Building2, MapPin, User, Mail } from 'lucide-react';
import { useCreateOrganization } from '../hooks/useCreateOrganization';
import type { CreateOrganizationResult } from '../services/adminService';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

type CreateOrganizationFormProps = {
  onSuccess?: (result: CreateOrganizationResult) => void;
};

export default function CreateOrganizationForm({ onSuccess }: CreateOrganizationFormProps) {
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [orgSlugTouched, setOrgSlugTouched] = useState(false);
  const [gymName, setGymName] = useState('');
  const [gymSlug, setGymSlug] = useState('');
  const [gymSlugTouched, setGymSlugTouched] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [gymTimezone, setGymTimezone] = useState('America/Los_Angeles');

  const mutation = useCreateOrganization();

  useEffect(() => {
    if (!orgSlugTouched) setOrgSlug(slugify(orgName));
  }, [orgName, orgSlugTouched]);

  useEffect(() => {
    if (!gymSlugTouched) setGymSlug(slugify(gymName));
  }, [gymName, gymSlugTouched]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.reset();
    try {
      const result = await mutation.mutateAsync({
        orgName: orgName.trim(),
        orgSlug: orgSlug.trim(),
        gymName: gymName.trim(),
        gymSlug: gymSlug.trim(),
        ownerEmail: ownerEmail.trim() || undefined,
        ownerFullName: ownerName.trim() || undefined,
        gymTimezone,
      });
      onSuccess?.(result);
    } catch {
      // mutation.error surfaced below
    }
  }

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : mutation.error ? String(mutation.error) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section>
        <SectionHeader title="Organization" hint="Top-level tenant. One owner, many gyms." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            id="orgName"
            label="Name"
            placeholder="Elite Discipline Association"
            icon={<Building2 className="w-4 h-4" />}
            value={orgName}
            onChange={setOrgName}
            required
          />
          <Field
            id="orgSlug"
            label="Slug"
            placeholder="elite-discipline"
            value={orgSlug}
            onChange={(value) => {
              setOrgSlugTouched(true);
              setOrgSlug(slugify(value));
            }}
            hint="URL-safe identifier. Lowercase letters, numbers, dashes."
            required
          />
        </div>
      </section>

      <section>
        <SectionHeader title="First Gym" hint="Primary location for this organization." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            id="gymName"
            label="Gym Name"
            placeholder="HQ"
            icon={<MapPin className="w-4 h-4" />}
            value={gymName}
            onChange={setGymName}
            required
          />
          <Field
            id="gymSlug"
            label="Slug"
            placeholder="hq"
            value={gymSlug}
            onChange={(value) => {
              setGymSlugTouched(true);
              setGymSlug(slugify(value));
            }}
            required
          />
          <Field
            id="gymTimezone"
            label="Timezone"
            placeholder="America/Los_Angeles"
            value={gymTimezone}
            onChange={setGymTimezone}
          />
        </div>
      </section>

      <section>
        <SectionHeader
          title="Owner (Invite)"
          hint="An invite token is created instead of an auth user. Pair this with the Edge Function for production."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            id="ownerName"
            label="Owner Full Name"
            placeholder="Sensei Reyes"
            icon={<User className="w-4 h-4" />}
            value={ownerName}
            onChange={setOwnerName}
          />
          <Field
            id="ownerEmail"
            label="Owner Email"
            type="email"
            placeholder="owner@dojo.com"
            icon={<Mail className="w-4 h-4" />}
            value={ownerEmail}
            onChange={setOwnerEmail}
            hint="Leave blank to create the org without an invite."
          />
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full md:w-auto bg-primary-container text-on-primary-fixed text-xs font-bold uppercase tracking-wider py-4 px-8 rounded-md hover:brightness-110 transition-all inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {mutation.isPending ? 'Creating...' : 'Create Organization'} <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}

function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-lg font-bold text-on-surface">{title}</h2>
      <p className="text-xs text-on-surface-variant mt-1">{hint}</p>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  hint?: string;
  required?: boolean;
};

function Field({ id, label, placeholder, type = 'text', value, onChange, icon, hint, required }: FieldProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-on-surface-variant mb-2 block uppercase tracking-wider" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-variant">
            {icon}
          </div>
        )}
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-surface border border-surface-container-high rounded-md ${
            icon ? 'pl-10' : 'pl-4'
          } pr-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary`}
        />
      </div>
      {hint && <p className="text-[11px] text-on-surface-variant/80 mt-1.5">{hint}</p>}
    </div>
  );
}
