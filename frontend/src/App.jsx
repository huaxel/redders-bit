import { Routes, Route, NavLink, Navigate, useLocation, Outlet } from 'react-router-dom'
import { FaChartPie, FaCalendarAlt, FaUsers, FaUserClock, FaSignOutAlt } from 'react-icons/fa'
import Dashboard from './pages/Dashboard'
import Planning from './pages/Planning'
import Employees from './pages/Employees'
import MySchedule from './pages/MySchedule'
import Login from './pages/Login'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function ProtectedRoute({ children }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}

function MainLayout() {
    const { logout, user } = useAuth();

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src="/logo.png" alt="Logo" className="logo" style={{ height: '40px', width: 'auto' }} />
                    <h1>Zwembadredders</h1>
                </div>

                <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon"><FaChartPie /></span>
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/planning" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon"><FaCalendarAlt /></span>
                    <span>Planning</span>
                </NavLink>

                <NavLink to="/employees" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon"><FaUsers /></span>
                    <span>Medewerkers</span>
                </NavLink>

                <NavLink to="/my-schedule" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <span className="nav-icon"><FaUserClock /></span>
                    <span>Mijn Rooster</span>
                </NavLink>

                <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ padding: '0 24px 12px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                        Ingelogd als:<br />
                        <strong style={{ color: user?.color }}>{user?.name}</strong>
                    </div>
                    <button
                        onClick={logout}
                        className="nav-link"
                        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                    >
                        <span className="nav-icon"><FaSignOutAlt /></span>
                        <span>Uitloggen</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/planning" element={<Planning />} />
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/my-schedule" element={<MySchedule />} />
                </Route>
            </Routes>
        </AuthProvider>
    )
}

export default App
