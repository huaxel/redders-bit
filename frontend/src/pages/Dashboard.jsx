import { useState, useEffect } from 'react'
import { FaUsers, FaLifeRing, FaGraduationCap, FaCalendarDay, FaCalendarAlt } from 'react-icons/fa'
import Card from '../components/Card'
import StatCard from '../components/StatCard'
import Button from '../components/Button'
import { client } from '../api/client'

function Dashboard() {
    const [stats, setStats] = useState({
        employees: 0,
        lifeguards: 0,
        instructors: 0,
        todayShifts: 0
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [complianceReport, setComplianceReport] = useState(null)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const res = await client.get('/api/employees')
            if (!res.ok) throw new Error('Failed to fetch data')
            const employees = await res.json()

            const now = new Date()
            const year = now.getFullYear()
            const month = String(now.getMonth() + 1).padStart(2, '0')
            const scheduleRes = await client.get(`/api/schedule/month/${year}/${month}`)
            const schedule = await scheduleRes.json()

            const today = now.toISOString().split('T')[0]
            const todayShifts = schedule.filter(s => s.date === today).length

            setStats({
                employees: employees.length,
                lifeguards: employees.filter(e => e.is_lifeguard).length,
                instructors: employees.filter(e => e.is_instructor).length,
                todayShifts
            })

            // Fetch Compliance Report
            const reportRes = await client.get(`/api/compliance/report/${year}/${month}`)
            if (reportRes.ok) {
                setComplianceReport(await reportRes.json())
            }
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

            <div className="card-grid" style={{ gridTemplateColumns: 'minmax(300px, 2fr) minmax(300px, 1fr)' }}>
                {/* Actions */}
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

                {/* Compliance Report Widget */}
                <Card>
                    <h3 style={{ marginBottom: '16px', color: 'var(--color-primary)' }}>📋 Urenregistratie & Validatie</h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {complianceReport ? (
                            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--color-accent)', textAlign: 'left' }}>
                                        <th style={{ padding: '8px' }}>Naam</th>
                                        <th style={{ padding: '8px' }}>Uren</th>
                                        <th style={{ padding: '8px' }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(complianceReport).map(([name, data]) => (
                                        <tr key={name} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '8px', fontWeight: 600 }}>{name}</td>
                                            <td style={{ padding: '8px' }}>{data.total_hours}u</td>
                                            <td style={{ padding: '8px' }}>
                                                {data.violations.length > 0 ? (
                                                    <span style={{ color: 'var(--color-danger)', fontSize: '18px' }} title={data.violations.join('\n')}>⚠️</span>
                                                ) : (
                                                    <span style={{ color: 'var(--color-success)', fontSize: '18px' }}>✅</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>Laden...</p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default Dashboard
