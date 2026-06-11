import { Route } from 'react-router-dom';
import KioskLayout from '../../layouts/KioskLayout';
import KioskScreen from '../../features/attendance/pages/KioskScreen';

/**
 * Fullscreen, layout-less kiosk surface. Public so a gym tablet does
 * not require a staff login; gym is resolved by slug or id.
 */
export function kioskRoutes() {
  return (
    <Route path="/kiosk" element={<KioskLayout />}>
      <Route path=":gymIdOrSlug" element={<KioskScreen />} />
    </Route>
  );
}
