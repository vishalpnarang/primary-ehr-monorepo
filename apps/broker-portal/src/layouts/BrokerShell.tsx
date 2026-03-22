import { Outlet } from 'react-router-dom';
import BrokerSidebar from './BrokerSidebar';

const BrokerShell = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <BrokerSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default BrokerShell;
