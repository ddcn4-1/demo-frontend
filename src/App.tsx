import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './components/admin/AdminDashboard';
import ClientApp from './components/client/ClientApp';
import LoginPage from './components/auth/LoginPage';

// Mock user context
interface User {
  id: string;
  email: string;
  role: 'admin' | 'client';
  permissions?: string[];
}

interface AppContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AppContext = React.createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('ticketing_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login logic
    if (email === 'admin@example.com' && password === 'admin123') {
      const adminUser: User = {
        id: '1',
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'manage_users']
      };
      setUser(adminUser);
      localStorage.setItem('ticketing_user', JSON.stringify(adminUser));
      return true;
    } else if (email === 'client@example.com' && password === 'client123') {
      const clientUser: User = {
        id: '2',
        email: 'client@example.com',
        role: 'client'
      };
      setUser(clientUser);
      localStorage.setItem('ticketing_user', JSON.stringify(clientUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ticketing_user');
  };

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ user, login, logout, isAdmin }}>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to={isAdmin ? "/admin" : "/client"} /> : <LoginPage />} 
          />
          <Route 
            path="/admin/*" 
            element={user && isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/client/*" 
            element={user ? <ClientApp /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={
              user ? 
                <Navigate to={isAdmin ? "/admin" : "/client"} /> : 
                <Navigate to="/login" />
            } 
          />
          {/* Catch-all route for unmatched paths */}
          <Route 
            path="*" 
            element={
              user ? 
                <Navigate to={isAdmin ? "/admin" : "/client"} replace /> : 
                <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
}

export default App;