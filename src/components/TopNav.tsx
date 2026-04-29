import { Search, Bell, Settings, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { useTenant } from '../features/tenancy/TenantProvider';

type TopNavProps = {
  onMenuClick?: () => void;
};

export default function TopNav({ onMenuClick }: TopNavProps) {
  const { user, signOut } = useAuth();
  const { activeOrganization } = useTenant();

  return (
    <header className="flex flex-shrink-0 items-center justify-between w-full px-6 sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-surface-container-high h-16">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="md:hidden text-on-surface-variant hover:text-on-surface transition-all active:scale-[0.98] duration-200" type="button">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center bg-surface-container rounded-full px-4 py-2 border border-surface-container-high focus-within:border-primary transition-colors">
          <Search className="text-on-surface-variant mr-2 w-4 h-4" />
          <input 
            className="bg-transparent border-none text-on-surface text-sm focus:outline-none focus:ring-0 placeholder:text-on-surface-variant/50 w-64" 
            placeholder="Search members, classes..." 
            type="text"
          />
        </div>
        {activeOrganization && (
          <div className="hidden xl:flex flex-col">
            <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Organization</span>
            <span className="text-sm font-semibold text-on-surface">{activeOrganization.organization.name}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button className="text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all active:scale-[0.98] duration-200 p-2 rounded-full flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </button>
        <Link to="/app/settings" className="text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all active:scale-[0.98] duration-200 p-2 rounded-full flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </Link>
        <button
          onClick={() => void signOut()}
          className="hidden sm:block text-xs font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors"
          type="button"
        >
          Sign Out
        </button>
        <div className="h-8 w-8 rounded-full border border-surface-container-high ml-2 select-none cursor-pointer bg-surface-container-high flex items-center justify-center">
          <span className="text-xs font-bold text-on-surface">{user?.email?.slice(0, 2).toUpperCase() ?? 'AO'}</span>
        </div>
      </div>
    </header>
  );
}
