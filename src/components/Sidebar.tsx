import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Swords, LayoutDashboard, Users, UsersRound, Target, CalendarCheck, Award, QrCode, HelpCircle, Settings } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app/dashboard' },
  { icon: Users, label: 'Students', path: '/app/students' },
  { icon: UsersRound, label: 'Instructors', path: '/app/instructors' },
  { icon: Target, label: 'Leads', path: '/app/leads' },
  { icon: CalendarCheck, label: 'Attendance', path: '/app/attendance' },
  { icon: Award, label: 'Promotions', path: '/app/promotions' },
];

export default function Sidebar() {
  return (
    <nav className="h-screen w-64 fixed left-0 top-0 border-r border-surface-container-high bg-background flex flex-col py-6 space-y-2 z-50">
      <div className="px-6 mb-8 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center">
             <Swords className="text-on-primary-container w-5 h-5" />
          </div>
          <h1 className="text-xl font-black text-primary font-display tracking-tight uppercase">AcademyOS</h1>
        </div>
        <span className="text-[10px] text-on-surface-variant uppercase tracking-widest pl-11">Elite Discipline</span>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
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

      <div className="px-6 pb-6 pt-4 space-y-4">
        <button className="w-full bg-primary text-on-primary-fixed hover:brightness-110 transition-all font-bold text-sm py-3 rounded flex items-center justify-center gap-2">
           <QrCode className="w-4 h-4" />
           Check-in Member
        </button>
        <div className="flex flex-col gap-1 pt-4">
           <a href="#" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
              <HelpCircle className="w-4 h-4" /> Support
           </a>
           <a href="#" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors">
              <Settings className="w-4 h-4" /> Settings
           </a>
        </div>
      </div>
    </nav>
  );
}
