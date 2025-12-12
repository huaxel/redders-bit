import { useState, useEffect } from 'react'
import { client } from '../api/client'
import { useAuth } from '../contexts/AuthContext'

function Employees() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    useEffect(() => {
        fetchEmployees()
    }, [])

    const fetchEmployees = async () => {
        try {
            const res = await client.get('/api/employees')
            const data = await res.json()
            setEmployees(data)
        } catch (error) {
            console.error('Failed to fetch employees:', error)
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
                <h2>Medewerkers</h2>
                <p>Beheer redders en lesgevers</p>
            </div>

            <div className="card">
                <table className="employee-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Naam</th>
                            <th>Email</th>
                            <th>Rollen</th>
                            {user?.role === 'admin' && <th>Contract</th>}
                            {user?.role === 'admin' && <th>Uurtarief</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(emp => (
                            <tr key={emp.id}>
                                <td>
                                    <div
                                        className="employee-avatar"
                                        style={{ backgroundColor: emp.color }}
                                    >
                                        {emp.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                </td>
                                <td style={{ fontWeight: 600 }}>{emp.name}</td>
                                <td style={{ color: 'var(--color-text-muted)' }}>{emp.email}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {emp.is_lifeguard === 1 && (
                                            <span className="badge lifeguard">🏊 Redder</span>
                                        )}
                                        {emp.is_instructor === 1 && (
                                            <span className="badge instructor">🎓 Lesgever</span>
                                        )}
                                        {emp.has_initiator_diploma === 1 && (
                                            <span className="badge" style={{
                                                background: 'rgba(16, 185, 129, 0.2)',
                                                color: 'var(--color-success)'
                                            }}>
                                                📜 Initiator
                                            </span>
                                        )}
                                    </div>
                                </td>
                                {user?.role === 'admin' && (
                                    <td>
                                        <span className={`badge ${emp.contract_type === 'voltijds' ? 'fulltime' : 'parttime'}`}>
                                            {emp.contract_type === 'voltijds' ? 'Voltijds' : 'Deeltijds'}
                                        </span>
                                    </td>
                                )}
                                {user?.role === 'admin' && (
                                    <td>€{emp.hourly_rate}/u</td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Employees
