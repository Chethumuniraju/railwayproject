import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Train, User, Search, Menu, X } from 'lucide-react';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Train className="h-8 w-8 text-[var(--primary-color)]" />
            <span className="text-xl font-bold text-[var(--primary-color)]">RailBooker</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/trains" className="text-gray-700 hover:text-[var(--primary-color)] transition-colors">
              Find Trains
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/bookings" className="text-gray-700 hover:text-[var(--primary-color)] transition-colors">
                  My Bookings
                </Link>
                
                {isAdmin && (
                  <Link to="/admin" className="text-gray-700 hover:text-[var(--primary-color)] transition-colors">
                    Admin Dashboard
                  </Link>
                )}
                
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700">
                    <User className="h-5 w-5" />
                    <span>{user?.username}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                    <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-[var(--primary-color)]">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-700" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </nav>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 fade-in">
            <Link 
              to="/trains" 
              className="block py-2 text-gray-700 hover:text-[var(--primary-color)]"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Trains
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/bookings" 
                  className="block py-2 text-gray-700 hover:text-[var(--primary-color)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Bookings
                </Link>
                
                <Link 
                  to="/dashboard" 
                  className="block py-2 text-gray-700 hover:text-[var(--primary-color)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="block py-2 text-gray-700 hover:text-[var(--primary-color)]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-gray-700 hover:text-[var(--primary-color)]"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link 
                  to="/login" 
                  className="block py-2 text-[var(--primary-color)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup"
                  className="btn btn-primary w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;