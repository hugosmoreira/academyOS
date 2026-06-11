import { Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '../features/auth/AuthProvider';
import { useProfile } from '../features/auth/ProfileProvider';

type AdminTopNavProps = {
  onMenuClick?: () => void;
};

export default function AdminTopNav({ onMenuClick }: AdminTopNavProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  return (
    <header className="flex flex-shrink-0 items-center justify-between w-full px-6 sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-surface-container-high h-16">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-on-surface-variant hover:text-on-surface transition-all active:scale-[0.98] duration-200"
          type="button"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-on-surface-variant">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          Platform Admin Console
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Signed in</span>
          <span className="text-sm font-semibold text-on-surface truncate max-w-[200px]">
            {profile?.full_name || user?.email}
          </span>
        </div>
        <button
          onClick={() => void signOut()}
          className="text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors"
          type="button"
        >
          Sign Out
        </button>
        <div className="h-8 w-8 rounded-full border border-surface-container-high bg-surface-container-high flex items-center justify-center">
          <span className="text-xs font-bold text-on-surface">
            {user?.email?.slice(0, 2).toUpperCase() ?? 'AO'}
          </span>
        </div>
      </div>
    </header>
  );
}
