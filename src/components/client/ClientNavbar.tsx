import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../App';
import { Button } from '../ui/button';
import { 
  Ticket, 
  User, 
  LogOut, 
  Calendar, 
  Menu, 
  X 
} from 'lucide-react';

const ClientNavbar: React.FC = () => {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/client')}
          >
            <Ticket className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">TicketHub</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate('/client')}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/client/performances')}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              All Events
            </button>
            <button
              onClick={() => navigate('/client/my-bookings')}
              className="text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              <Calendar className="h-4 w-4" />
              My Bookings
            </button>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <User className="h-4 w-4" />
              <span className="text-sm">{user?.email}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  navigate('/client');
                  setIsMobileMenuOpen(false);
                }}
                className="text-left text-gray-700 hover:text-blue-600 transition-colors py-2"
              >
                Home
              </button>
              <button
                onClick={() => {
                  navigate('/client/performances');
                  setIsMobileMenuOpen(false);
                }}
                className="text-left text-gray-700 hover:text-blue-600 transition-colors py-2"
              >
                All Events
              </button>
              <button
                onClick={() => {
                  navigate('/client/my-bookings');
                  setIsMobileMenuOpen(false);
                }}
                className="text-left text-gray-700 hover:text-blue-600 transition-colors py-2 flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                My Bookings
              </button>
              
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center space-x-2 text-gray-700 py-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user?.email}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full justify-start"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default ClientNavbar;