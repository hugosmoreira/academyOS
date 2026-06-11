import { NavLink } from 'react-router-dom';
import { Building2, Inbox, LayoutDashboard, Users, MapPin, Settings, ShieldCheck, Swords } from 'lucide-react';
import { cn } from '../lib/utils';

const adminNav = [
  {
    label: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', end: true },
      { icon: Inbox, label: 'Sales Leads', path: '/admin/sales-leads' },
    ],
  },
  {
    label: 'Tenants',
    items: [
      { icon: MapPin, label: 'Gyms', path: '/admin/gyms' },
      { icon: Building2, label: 'Business Accounts', path: '/admin/organizations' },
      { icon: Users, label: 'Users', path: '/admin/users' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ],
  },
];

type AdminSidebarProps = {
  onNavigate?: () => void;
};

export default function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  return (
    <nav className="h-screen w-64 fixed left-0 top-0 border-r border-surface-container-high bg-background flex flex-col py-6 space-y-2 z-50">
      <div className="px-6 mb-8 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center">
            <Swords className="text-on-primary-container w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-primary font-display tracking-tight uppercase">AcademyOS</h1>
        </div>
        <span className="text-[10px] text-on-surface-variant uppercase tracking-widest pl-11 flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-primary" /> Platform Admin
        </span>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col space-y-5">
        {adminNav.map((section) => (
          <div key={section.label}>
            <div className="px-6 mb-2 text-[10px] uppercase tracking-widest text-on-surface-variant/70 font-bold">
              {section.label}
            </div>
            <div className="flex flex-col space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-6 py-3 gap-3 cursor-pointer transition-all duration-150 text-sm font-medium border-l-[3px]',
                      isActive
                        ? 'bg-surface-container text-primary border-primary'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/50 border-transparent',
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 pb-6 pt-4">
        <NavLink
          to="/admin/gyms/new"
          onClick={onNavigate}
          className="w-full bg-primary text-on-primary-fixed hover:brightness-110 transition-all font-bold text-sm py-3 rounded flex items-center justify-center gap-2"
        >
          <MapPin className="w-4 h-4" />
          New Gym
        </NavLink>
      </div>
    </nav>
  );
}
