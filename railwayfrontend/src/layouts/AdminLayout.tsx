import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Train, Map, BookOpen, Users, BarChart, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center p-3 rounded-lg transition-colors ${
      isActive 
        ? 'bg-[var(--primary-color)] text-white' 
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* Sidebar */}
      <aside 
        className={`fixed md:static top-0 left-0 w-64 h-full bg-white shadow-md z-40 transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Train className="h-8 w-8 text-[var(--primary-color)]" />
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          </div>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <NavLink 
                to="/admin" 
                end
                className={navLinkClass}
                onClick={() => setIsSidebarOpen(false)}
              >
                <BarChart className="h-5 w-5 mr-3" />
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/trains" 
                className={navLinkClass}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Train className="h-5 w-5 mr-3" />
                Manage Trains
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/stations" 
                className={navLinkClass}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Map className="h-5 w-5 mr-3" />
                Manage Stations
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin/bookings" 
                className={navLinkClass}
                onClick={() => setIsSidebarOpen(false)}
              >
                <BookOpen className="h-5 w-5 mr-3" />
                View Bookings
              </NavLink>
            </li>
          </ul>
          
          <div className="mt-8 pt-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;