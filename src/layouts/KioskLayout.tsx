import { Outlet } from 'react-router-dom';

/**
 * Fullscreen kiosk shell. Deliberately empty so a tablet running the
 * kiosk experience does not show any staff sidebar or top nav.
 */
export default function KioskLayout() {
  return (
    <div className="min-h-screen w-full bg-background text-on-surface">
      <Outlet />
    </div>
  );
}
