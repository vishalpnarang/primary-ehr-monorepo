import { Outlet } from 'react-router-dom';
import AffiliateSidebar from './AffiliateSidebar';

const AffiliateShell = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AffiliateSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AffiliateShell;
