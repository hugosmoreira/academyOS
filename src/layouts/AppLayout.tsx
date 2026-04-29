import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

export default function AppLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="bg-background text-on-surface flex min-h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsMobileNavOpen(false)}
            type="button"
          />
          <Sidebar onNavigate={() => setIsMobileNavOpen(false)} />
        </div>
      )}
      <main className="flex-1 flex flex-col min-h-screen relative md:ml-64 w-full">
        <TopNav onMenuClick={() => setIsMobileNavOpen(true)} />
        <div className="flex-1 overflow-y-auto w-full">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
