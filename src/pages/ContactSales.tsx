import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Building2, Mail, Phone, User, Swords, CheckCircle2 } from 'lucide-react';
import { submitSalesLead } from '../services/salesLeadService';

export default function ContactSales() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get('fullName') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const academyName = String(formData.get('academyName') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();
    const notes = String(formData.get('notes') ?? '').trim();

    try {
      await submitSalesLead({
        fullName,
        email,
        academyName: academyName || null,
        phone: phone || null,
        message: notes || null,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send your request.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <nav className="flex items-center justify-between w-full px-6 sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-surface-container-high h-16">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center">
            <Swords className="text-on-primary-container w-5 h-5" />
          </div>
          <span className="text-xl font-black text-primary tracking-tighter uppercase font-display">AcademyOS</span>
        </Link>
        <Link to="/login" className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
          Already a customer? Log in
        </Link>
      </nav>

      <main className="flex-1 flex items-start justify-center px-6 py-16">
        <div className="w-full max-w-3xl grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link to="/" className="text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors inline-flex items-center gap-1.5 mb-8">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to home
            </Link>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface mb-4 leading-tight">
              Book a demo with AcademyOS
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
              AcademyOS is purpose-built for martial arts academies and provisioned by our team.
              Tell us a little about your gym and we'll set up your organization, primary location,
              and owner account, then walk you through onboarding.
            </p>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Concierge organization setup with your branding and gym roster.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Owner and head coach accounts created securely via invite.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Migration help for existing students, classes, and billing data.</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3 rounded-2xl border border-surface-container-high bg-surface-container-low p-8 shadow-2xl">
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-primary-container/30 border border-primary/30 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold text-on-surface mb-3">Request received</h2>
                <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
                  A member of our team will reach out within one business day to schedule your
                  walkthrough. In the meantime, feel free to explore the platform tour.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 bg-primary-container text-on-primary-fixed text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-md hover:brightness-110 transition-all"
                >
                  Back to home <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <h2 className="font-display text-xl font-bold text-on-surface">Tell us about your academy</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field id="fullName" label="Your Name" placeholder="Sensei Reyes" icon={<User className="w-4 h-4" />} required />
                  <Field id="email" label="Work Email" type="email" placeholder="owner@dojo.com" icon={<Mail className="w-4 h-4" />} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field id="academyName" label="Academy Name" placeholder="Elite Discipline" icon={<Building2 className="w-4 h-4" />} required />
                  <Field id="phone" label="Phone (optional)" placeholder="(555) 123-4567" icon={<Phone className="w-4 h-4" />} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant mb-2 block uppercase tracking-wider" htmlFor="notes">
                    What would you like to accomplish?
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    className="w-full bg-surface border border-surface-container-high rounded-md px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Members count, current software, biggest pain points..."
                  />
                </div>
                {error && (
                  <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-container text-on-primary-fixed text-xs font-bold uppercase tracking-wider py-4 rounded-md hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Request a Demo'} <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-on-surface-variant/70 text-center">
                  AcademyOS does not offer self-service student or gym signup. New accounts are
                  provisioned by our team after we review your request.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
  icon: React.ReactNode;
  required?: boolean;
};

function Field({ id, label, placeholder, type = 'text', icon, required }: FieldProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-on-surface-variant mb-2 block uppercase tracking-wider" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-variant">
          {icon}
        </div>
        <input
          id={id}
          name={id}
          type={type}
          required={required}
          placeholder={placeholder}
          className="w-full bg-surface border border-surface-container-high rounded-md pl-10 pr-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
    </div>
  );
}
