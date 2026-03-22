import { Outlet } from 'react-router-dom';
import EmployerSidebar from './EmployerSidebar';

const EmployerShell = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <EmployerSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default EmployerShell;
