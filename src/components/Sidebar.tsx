import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Swords, LayoutDashboard, Users, UsersRound, Target, CalendarCheck, Award, QrCode, HelpCircle, Settings, Layers, CreditCard, CalendarDays, BarChart3, ShieldCheck, Megaphone } from 'lucide-react';
import { useTenant } from '../features/tenancy/TenantProvider';
import { useProfile } from '../features/auth/ProfileProvider';
import { gymPath, remapPathToGym } from '../features/tenancy/gymPaths';
import type { PrimaryRole } from '../features/auth/roles';

type NavItem = {
  icon: typeof LayoutDashboard;
  label: string;
  segment: string;
  roles?: PrimaryRole[];
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const ALL_STAFF: PrimaryRole[] = ['organization_owner', 'gym_admin', 'instructor', 'front_desk'];
const MANAGERS: PrimaryRole[] = ['organization_owner', 'gym_admin'];

const navSections: NavSection[] = [
  {
    label: 'Operate',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', segment: 'dashboard', roles: ALL_STAFF },
      { icon: Users, label: 'Students', segment: 'students', roles: ALL_STAFF },
      { icon: UsersRound, label: 'Instructors', segment: 'staff', roles: MANAGERS },
      { icon: Target, label: 'Leads', segment: 'leads', roles: [...MANAGERS, 'front_desk'] },
      { icon: CalendarDays, label: 'Programs', segment: 'programs', roles: ALL_STAFF },
      { icon: CalendarCheck, label: 'Attendance', segment: 'attendance', roles: ALL_STAFF },
      { icon: Award, label: 'Promotions', segment: 'promotions', roles: [...MANAGERS, 'instructor'] },
    ],
  },
  {
    label: 'Revenue',
    items: [
      { icon: CreditCard, label: 'Plans', segment: 'plans', roles: MANAGERS },
      { icon: BarChart3, label: 'Collections', segment: 'billing', roles: [...MANAGERS, 'front_desk'] },
    ],
  },
  {
    label: 'Growth',
    items: [
      { icon: Layers, label: 'Events', segment: 'events', roles: ALL_STAFF },
      { icon: Megaphone, label: 'Messaging', segment: 'messaging', roles: MANAGERS },
      { icon: ShieldCheck, label: 'Waivers', segment: 'waivers', roles: ALL_STAFF },
    ],
  },
];

function filterSections(sections: NavSection[], role: PrimaryRole): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.roles || item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0);
}

type SidebarProps = {
  onNavigate?: () => void;
};

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { activeGym, gyms, setActiveGymId, activeOrganization } = useTenant();
  const { primaryRole } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const visibleSections = filterSections(navSections, primaryRole);
  const gymId = activeGym?.gym.id ?? null;
  const gymLabel = activeGym?.gym.name ?? 'Select a gym';
  const showBusinessAccount =
    Boolean(activeOrganization) &&
    gyms.filter((g) => g.organizationId === activeOrganization?.organization.id).length > 1;

  function handleGymChange(nextGymId: string) {
    setActiveGymId(nextGymId);
    const remapped = remapPathToGym(location.pathname, nextGymId);
    if (remapped) {
      navigate(remapped);
    } else {
      navigate(gymPath(nextGymId, 'dashboard'));
    }
  }

  return (
    <nav className="h-screen w-64 fixed left-0 top-0 border-r border-surface-container-high bg-background flex flex-col py-6 space-y-2 z-50">
      <div className="px-6 mb-8 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center">
             <Swords className="text-on-primary-container w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-primary font-display tracking-tight uppercase">AcademyOS</h1>
        </div>
        <span className="text-[10px] text-on-surface-variant uppercase tracking-widest pl-11 truncate">{gymLabel}</span>
        {showBusinessAccount && activeOrganization && (
          <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-widest pl-11 truncate">
            {activeOrganization.organization.name}
          </span>
        )}
        {gyms.length > 0 && (
          <select
            value={activeGym?.gym.id ?? ''}
            onChange={(event) => handleGymChange(event.target.value)}
            className="mt-4 w-full bg-surface-container border border-surface-container-high rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            {gyms.map((membership) => (
              <option key={membership.gym.id} value={membership.gym.id}>
                {membership.gym.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col space-y-5">
        {visibleSections.map((section) => (
          <div key={section.label}>
            <div className="px-6 mb-2 text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-bold">
              {section.label}
            </div>
            <div className="flex flex-col space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.label}
                  to={gymPath(gymId, item.segment)}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-6 py-3 gap-3 cursor-pointer transition-all duration-150 text-sm font-medium border-l-[3px]",
                      isActive 
                        ? "bg-surface-container text-primary border-primary" 
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50 border-transparent"
                    )
                  }
                >
                  <item.icon className={cn("w-5 h-5")} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 pb-6 pt-4 space-y-4">
        <NavLink
          to={activeGym ? `/kiosk/${activeGym.gym.slug ?? activeGym.gym.id}` : '/app/kiosk'}
          onClick={onNavigate}
          target={activeGym ? '_blank' : undefined}
          rel={activeGym ? 'noreferrer' : undefined}
          className="w-full bg-primary text-on-primary-fixed hover:brightness-110 transition-all font-bold text-sm py-3 rounded flex items-center justify-center gap-2"
        >
           <QrCode className="w-4 h-4" />
           Check-in Member
        </NavLink>
        <div className="flex flex-col gap-1 pt-4">
           <a href="#" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
              <HelpCircle className="w-4 h-4" /> Support
           </a>
           <NavLink to={gymPath(gymId, 'settings')} onClick={onNavigate} className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
              <Settings className="w-4 h-4" /> Settings
           </NavLink>
        </div>
      </div>
    </nav>
  );
}
