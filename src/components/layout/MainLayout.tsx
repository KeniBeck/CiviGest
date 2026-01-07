import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const MainLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
