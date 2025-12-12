import { useState, useEffect } from 'react'

function Dashboard() {
    const [stats, setStats] = useState({
        employees: 0,
        lifeguards: 0,
        instructors: 0,
        todayShifts: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/employees')
            const employees = await res.json()

            const now = new Date()
            const year = now.getFullYear()
            const month = String(now.getMonth() + 1).padStart(2, '0')
            const scheduleRes = await fetch(`/api/schedule/month/${year}/${month}`)
            const schedule = await scheduleRes.json()

            const today = now.toISOString().split('T')[0]
            const todayShifts = schedule.filter(s => s.date === today).length

            setStats({
                employees: employees.length,
                lifeguards: employees.filter(e => e.is_lifeguard).length,
                instructors: employees.filter(e => e.is_instructor).length,
                todayShifts
            })
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="loading">Laden...</div>
    }

    return (
        <div>
            <div className="page-header">
                <h2>Dashboard</h2>
                <p>Overzicht van je zwembad planning</p>
            </div>

            <div className="card-grid">
                <div className="card stat-card">
                    <div className="stat-icon primary">👥</div>
                    <div className="stat-content">
                        <h3>{stats.employees}</h3>
                        <p>Medewerkers</p>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="stat-icon success">🏊</div>
                    <div className="stat-content">
                        <h3>{stats.lifeguards}</h3>
                        <p>Redders</p>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="stat-icon secondary">🎓</div>
                    <div className="stat-content">
                        <h3>{stats.instructors}</h3>
                        <p>Lesgevers</p>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="stat-icon warning">📅</div>
                    <div className="stat-content">
                        <h3>{stats.todayShifts}</h3>
                        <p>Shiften vandaag</p>
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '16px' }}>⚡ Snelle acties</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <a href="/planning" className="btn btn-primary">
                        📅 Naar Planning
                    </a>
                    <a href="/employees" className="btn btn-primary">
                        👥 Medewerkers Beheren
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
