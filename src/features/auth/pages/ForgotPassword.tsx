import { useState, type FormEvent } from 'react';
import { ArrowRight, Mail, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthProvider';

export default function ForgotPassword() {
  const { sendPasswordReset } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '');

    try {
      await sendPasswordReset(email);
      setMessage('Password reset instructions have been sent if the email exists.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send password reset instructions.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-on-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-surface-container-high bg-surface-container-low p-8 shadow-2xl">
        <Link to="/" className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded flex items-center justify-center">
            <Swords className="text-on-primary-container w-6 h-6" />
          </div>
          <span className="text-2xl text-primary tracking-tighter uppercase font-black font-display">AcademyOS</span>
        </Link>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-on-surface mb-2">Reset Password</h1>
          <p className="text-sm text-on-surface-variant">Enter your account email and AcademyOS will send a secure reset link.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold text-on-surface-variant mb-2 block uppercase tracking-wider" htmlFor="email">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-variant w-4 h-4" />
              <input id="email" name="email" type="email" required className="w-full bg-surface border border-surface-container-high rounded-md pl-10 pr-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
            </div>
          </div>

          {error && <div className="rounded-md border border-error/30 bg-error-container/20 px-4 py-3 text-sm text-error">{error}</div>}
          {message && <div className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">{message}</div>}

          <button disabled={isSubmitting} className="w-full bg-primary-container text-on-primary-fixed text-xs font-bold uppercase tracking-wider py-4 rounded-md hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed" type="submit">
            {isSubmitting ? 'Sending...' : 'Send Reset Link'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-on-surface-variant">
          Remembered it?
          <Link to="/login" className="ml-2 text-primary hover:text-primary-fixed font-medium">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
