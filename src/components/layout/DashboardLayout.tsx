import { Sidebar } from '../dashboard/Sidebar';
import { Header } from '../dashboard/Header';
import { Outlet } from 'react-router-dom';

interface DashboardLayoutProps {
  user?: any;
  onLogout?: () => void;
}

export function DashboardLayout({ user, onLogout }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-white font-sans overflow-hidden text-[#586069] text-sm">
      <Sidebar 
        onLogout={onLogout} 
        user={user}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        <Header />
        <div className="flex-1 overflow-y-auto ">
          <div className="max-w-350 px-8 py-8 mx-auto">
            {/* Pages will be rendered here by React Router */}
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
