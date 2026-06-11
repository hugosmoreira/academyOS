import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { publicRoutes } from './routes/publicRoutes';
import { appRoutes } from './routes/appRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { portalRoutes } from './routes/portalRoutes';
import { kioskRoutes } from './routes/kioskRoutes';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {publicRoutes()}
        {adminRoutes()}
        {appRoutes()}
        {portalRoutes()}
        {kioskRoutes()}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
