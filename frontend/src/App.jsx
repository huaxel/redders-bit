import { Routes, Route, NavLink } from 'react-router-dom'
import { FaChartPie, FaCalendarAlt, FaUsers, FaUserClock, FaSwimmer } from 'react-icons/fa'
import Dashboard from './pages/Dashboard'
import Planning from './pages/Planning'
import Employees from './pages/Employees'
import MySchedule from './pages/MySchedule'

function App() {
    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <span className="logo" style={{ color: 'var(--color-primary)', display: 'flex', fontSize: '32px' }}><FaSwimmer /></span>
                    <h1>Zwembadredders</h1>
                </div>

                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
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
            </aside>

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/planning" element={<Planning />} />
                    <Route path="/employees" element={<Employees />} />
                    <Route path="/my-schedule" element={<MySchedule />} />
                </Routes>
            </main>
        </div>
    )
}

export default App
