import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, CheckSquare, CreditCard, ShieldCheck } from 'lucide-react';
import PortalNav from '../components/PortalNav';
import { cn } from '../lib/utils';

const mobileLinks = [
  { icon: LayoutDashboard, label: 'Overview', path: '/portal/dashboard', end: true },
  { icon: CalendarDays, label: 'Classes', path: '/portal/classes' },
  { icon: CheckSquare, label: 'Attendance', path: '/portal/attendance' },
  { icon: CreditCard, label: 'Billing', path: '/portal/billing' },
  { icon: ShieldCheck, label: 'Waivers', path: '/portal/waivers' },
];

export default function PortalLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      <PortalNav onMenuToggle={() => setIsMobileNavOpen((open) => !open)} />
      {isMobileNavOpen && (
        <div className="md:hidden border-b border-surface-container-high bg-surface-container-low">
          <div className="flex flex-col px-4 py-3 gap-1">
            {mobileLinks.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.end}
                onClick={() => setIsMobileNavOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2 text-sm font-medium rounded-md flex items-center gap-2',
                    isActive
                      ? 'text-primary bg-surface-container'
                      : 'text-on-surface-variant hover:text-on-surface',
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  );
}
