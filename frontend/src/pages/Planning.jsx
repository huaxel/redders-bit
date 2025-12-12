import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

function Planning() {
    const [events, setEvents] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const now = new Date()
            const year = now.getFullYear()
            const month = String(now.getMonth() + 1).padStart(2, '0')

            const [scheduleRes, employeesRes] = await Promise.all([
                fetch(`/api/schedule/month/${year}/${month}`),
                fetch('/api/employees')
            ])

            const schedule = await scheduleRes.json()
            const emps = await employeesRes.json()

            setEmployees(emps)

            // Transform schedule items to FullCalendar events
            const calendarEvents = schedule.map(item => ({
                id: item.id,
                title: `${item.user_name} (${item.type === 'redder' ? '🏊' : '🎓'})`,
                start: `${item.date}T${item.start_time}`,
                end: `${item.date}T${item.end_time}`,
                backgroundColor: item.user_color,
                borderColor: item.user_color,
                extendedProps: {
                    type: item.type,
                    userId: item.user_id
                }
            }))

            setEvents(calendarEvents)
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDateSelect = async (selectInfo) => {
        const title = prompt('Medewerker naam:')
        if (!title) return

        const employee = employees.find(e =>
            e.name.toLowerCase().includes(title.toLowerCase())
        )

        if (!employee) {
            alert('Medewerker niet gevonden')
            return
        }

        const type = employee.is_lifeguard ? 'redder' : 'lesgever'

        try {
            const res = await fetch('/api/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: employee.id,
                    date: selectInfo.startStr.split('T')[0],
                    start_time: '09:00',
                    end_time: '17:00',
                    type
                })
            })

            const data = await res.json()

            if (!res.ok) {
                alert(data.error || data.warning)
                return
            }

            fetchData() // Refresh
        } catch (error) {
            console.error('Failed to create schedule:', error)
        }
    }

    if (loading) {
        return <div className="loading">Laden...</div>
    }

    return (
        <div>
            <div className="page-header">
                <h2>Planning</h2>
                <p>Maandplanning voor redders en lesgevers</p>
            </div>

            <div className="card">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    locale="nl"
                    firstDay={1}
                    events={events}
                    selectable={true}
                    select={handleDateSelect}
                    eventClick={(info) => {
                        if (confirm(`Verwijder shift van ${info.event.title}?`)) {
                            fetch(`/api/schedule/${info.event.id}`, { method: 'DELETE' })
                                .then(() => fetchData())
                        }
                    }}
                    height="auto"
                />
            </div>

            <div className="card" style={{ marginTop: '24px' }}>
                <h3 style={{ marginBottom: '12px' }}>📋 Legende</h3>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    {employees.map(emp => (
                        <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '16px',
                                height: '16px',
                                borderRadius: '4px',
                                backgroundColor: emp.color
                            }} />
                            <span>{emp.name}</span>
                            {emp.is_lifeguard && <span className="badge lifeguard">Redder</span>}
                            {emp.is_instructor && <span className="badge instructor">Lesgever</span>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Planning
