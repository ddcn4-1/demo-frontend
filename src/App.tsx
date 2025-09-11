import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";
import { LoginForm } from "./components/LoginForm";
import { ClientDashboard } from "./components/ClientDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { PerformanceDetail } from "./components/PerformanceDetail";
import { SeatSelection } from "./components/SeatSelection";
import { Breadcrumb } from "./components/Breadcrumb";
import { Button } from "./components/ui/button";
import { LogOut } from "lucide-react";
import { User, Performance } from "./data/mockServer";

// Protected Route Component - redirects to login but preserves intended destination
function ProtectedRoute({
  children,
  user,
  redirectTo = "/login",
}: {
  children?: React.ReactNode;
  user: User | null;
  redirectTo?: string;
}) {
  const location = useLocation();

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

// Public Layout Component (for non-authenticated users)
function PublicLayout({
  user,
  onLogin,
  onLogout,
}: {
  user: User | null;
  onLogin: (userData: User) => void;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1
              className="text-xl font-medium cursor-pointer hover:text-primary/80"
              onClick={() => navigate("/")}
            >
              Ticket Booking System
            </h1>
            {user ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Welcome, {user.name} ({user.role})
                </p>
                <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded mt-1">
                  {location.pathname}
                  {location.search}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Browse performances •{" "}
                <span
                  className="cursor-pointer text-primary hover:underline"
                  onClick={() => navigate("/login")}
                >
                  Login
                </span>{" "}
                to book tickets
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {user ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard?tab=history")}
                >
                  My Bookings
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onLogout();
                    navigate("/");
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate("/login")}>Login</Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Breadcrumb />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<ClientDashboard user={user} />} />
          <Route
            path="/performances"
            element={<ClientDashboard user={user} />}
          />
          <Route
            path="/performances/:id"
            element={<PerformanceDetailRoute user={user} />}
          />

          {/* Protected Routes */}
          <Route
            path="/performances/:id/booking"
            element={
              <ProtectedRoute user={user}>
                <SeatSelectionRoute user={user!} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <ClientDashboard user={user!} />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          {user &&
            (user.role === "ADMIN" ||
              user.role === "DevOps" ||
              user.role === "Dev") && (
              <Route path="/admin/*" element={<AdminDashboard user={user} />} />
            )}

          {/* Login Route */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate
                  to={user.role === "USER" ? "/dashboard" : "/admin"}
                  replace
                />
              ) : (
                <LoginForm onLogin={onLogin} />
              )
            }
          />

          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// Admin Layout Component (for authenticated admin users)
function AdminLayout({ user, onLogout }: { user: User; onLogout: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1
              className="text-xl font-medium cursor-pointer hover:text-primary/80"
              onClick={() => navigate("/admin")}
            >
              Ticket Booking System - Admin
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {user.name} ({user.role})
            </p>
            <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded mt-1">
              {location.pathname}
              {location.search}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              View Public Site
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Breadcrumb />
        <AdminDashboard user={user} />
      </main>
    </div>
  );
}

// Route Components for Performance Detail and Seat Selection
function PerformanceDetailRoute({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const performance = location.state?.performance as Performance;

  if (!performance) {
    navigate("/");
    return null;
  }

  const handleBack = () => {
    navigate("/");
  };

  const handleBookNow = (perf: Performance) => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    navigate(`/performances/${perf.performance_id}/booking`, {
      state: { performance: perf },
    });
  };

  return (
    <PerformanceDetail
      performance={performance}
      onBack={handleBack}
      onBookNow={handleBookNow}
    />
  );
}

function SeatSelectionRoute({ user }: { user: User }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const performance = location.state?.performance as Performance;

  // Get performanceId from URL params or performance object
  const performanceId = id ? parseInt(id) : performance?.performance_id;

  if (!performanceId) {
    navigate("/");
    return null;
  }

  const handleBack = () => {
    if (performance) {
      navigate(`/performances/${performanceId}`, { state: { performance } });
    } else {
      navigate("/");
    }
  };

  const handleComplete = () => {
    navigate("/dashboard?tab=history");
  };

  // Convert User to UserInfo format expected by SeatSelection
  const userInfo = {
    userId: user.user_id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
    lastLogin: user.last_login,
  };

  return (
    <SeatSelection
      performanceId={performanceId}
      user={userInfo}
      onBack={handleBack}
      onComplete={handleComplete}
    />
  );
}

// Main App Component
function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("currentUser", JSON.stringify(userData));

    // Navigate to intended destination or appropriate dashboard
    const intendedDestination = location.state?.from?.pathname;
    if (intendedDestination && intendedDestination !== "/login") {
      navigate(intendedDestination + (location.state?.from?.search || ""));
    } else {
      navigate(userData.role === "USER" ? "/dashboard" : "/admin");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("mockAuthToken");
  };

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Admin Routes - require authentication and admin role */}
      <Route
        path="/admin/*"
        element={
          user &&
          (user.role === "ADMIN" ||
            user.role === "DevOps" ||
            user.role === "Dev") ? (
            <AdminLayout user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* All other routes use public layout */}
      <Route
        path="/*"
        element={
          <PublicLayout
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
