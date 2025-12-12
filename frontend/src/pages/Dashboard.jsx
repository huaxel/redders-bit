import { useState, useEffect } from 'react'
import { FaUsers, FaLifeRing, FaGraduationCap, FaCalendarDay, FaCalendarAlt } from 'react-icons/fa'
import Card from '../components/Card'
import StatCard from '../components/StatCard'
import Button from '../components/Button'

function Dashboard() {
    const [stats, setStats] = useState({
        employees: 0,
        lifeguards: 0,
        instructors: 0,
        todayShifts: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/employees')
            if (!res.ok) throw new Error('Failed to fetch data')
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
        } catch (err) {
            console.error('Failed to fetch stats:', err)
            setError('Kon statistieken niet laden. Probeer het later opnieuw.')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="loading">
                <div className="spinner" role="status" aria-label="Laden..."></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="alert warning" role="alert">
                <span>⚠️</span>
                {error}
            </div>
        )
    }

    return (
        <div>
            <div className="page-header">
                <h2>Dashboard</h2>
                <p>Overzicht van je zwembad planning</p>
            </div>

            <div className="card-grid">
                <StatCard
                    icon={<FaUsers />}
                    value={stats.employees}
                    label="Medewerkers"
                    variant="primary"
                />
                <StatCard
                    icon={<FaLifeRing />}
                    value={stats.lifeguards}
                    label="Redders"
                    variant="success"
                />
                <StatCard
                    icon={<FaGraduationCap />}
                    value={stats.instructors}
                    label="Lesgevers"
                    variant="secondary"
                />
                <StatCard
                    icon={<FaCalendarDay />}
                    value={stats.todayShifts}
                    label="Shiften vandaag"
                    variant="warning"
                />
            </div>

            <Card>
                <h3 style={{ marginBottom: '16px' }}>⚡ Snelle acties</h3>
                <div className="actions-container">
                    <Button to="/planning" variant="primary">
                        <FaCalendarAlt /> Naar Planning
                    </Button>
                    <Button to="/employees" variant="primary">
                        <FaUsers /> Medewerkers Beheren
                    </Button>
                </div>
            </Card>
        </div>
    )
}

export default Dashboard
