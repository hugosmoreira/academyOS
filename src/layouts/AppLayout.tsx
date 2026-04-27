import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

export default function AppLayout() {
  return (
    <div className="bg-background text-on-surface flex min-h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <main className="flex-1 flex flex-col min-h-screen relative md:ml-64 w-full">
        <TopNav />
        <div className="flex-1 overflow-y-auto w-full">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
