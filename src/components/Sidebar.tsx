import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Swords, LayoutDashboard, Users, Layers, Calendar, CreditCard, FileText } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
  { icon: Users, label: 'People', path: '/app/people' },
  { icon: Layers, label: 'Programs', path: '/app/programs' },
  { icon: Calendar, label: 'Classes', path: '/app/classes' },
  { icon: CreditCard, label: 'Billing', path: '/app/billing' },
  { icon: FileText, label: 'Waivers', path: '/app/waivers' },
];

export default function Sidebar() {
  return (
    <nav className="h-screen w-64 fixed left-0 top-0 border-r border-surface-container-high bg-surface-container-lowest flex flex-col py-6 space-y-2 z-50">
      <div className="px-6 mb-8 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
             <Swords className="text-on-primary-fixed w-5 h-5" />
          </div>
          <h1 className="text-lg font-black text-primary font-display tracking-tight uppercase">AcademyOS</h1>
        </div>
        <span className="text-[10px] text-on-surface-variant uppercase tracking-widest pl-11">Elite Management</span>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center px-4 py-3 gap-3 cursor-pointer transition-all duration-150 text-sm font-medium border-l-4",
                isActive 
                  ? "bg-surface-container-high text-primary border-primary" 
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container border-transparent"
              )
            }
          >
            <item.icon className={cn("w-5 h-5", "stroke-[1.5]")} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
