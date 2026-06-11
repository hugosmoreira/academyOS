import { NavLink, Link } from 'react-router-dom';
import {
  Swords,
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  CreditCard,
  ShieldCheck,
  Sparkles,
  User,
  Menu,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../features/auth/AuthProvider';
import { useProfile } from '../features/auth/ProfileProvider';

const portalNav = [
  { icon: LayoutDashboard, label: 'Overview', path: '/portal/dashboard', end: true },
  { icon: CalendarDays, label: 'Schedule', path: '/portal/schedule' },
  { icon: CheckSquare, label: 'Attendance', path: '/portal/attendance' },
  { icon: Sparkles, label: 'Progress', path: '/portal/progress' },
  { icon: CreditCard, label: 'Billing', path: '/portal/billing' },
  { icon: ShieldCheck, label: 'Waivers', path: '/portal/waivers' },
  { icon: User, label: 'Profile', path: '/portal/profile' },
];

type PortalNavProps = {
  onMenuToggle?: () => void;
};

export default function PortalNav({ onMenuToggle }: PortalNavProps) {
  const { signOut, user } = useAuth();
  const { profile } = useProfile();

  return (
    <header className="flex flex-shrink-0 items-center justify-between w-full px-6 sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-surface-container-high h-16">
      <div className="flex items-center gap-6">
        <button
          onClick={onMenuToggle}
          className="md:hidden text-on-surface-variant hover:text-on-surface"
          type="button"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/portal/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-primary-container flex items-center justify-center">
            <Swords className="text-on-primary-container w-4 h-4" />
          </div>
          <span className="text-lg font-black text-primary font-display tracking-tight uppercase">
            AcademyOS
          </span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-widest text-on-surface-variant ml-1">
            Member Portal
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {portalNav.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2',
                  isActive
                    ? 'text-primary bg-surface-container'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60',
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Signed in</span>
          <span className="text-xs font-semibold text-on-surface truncate max-w-[160px]">
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
      </div>
    </header>
  );
}
