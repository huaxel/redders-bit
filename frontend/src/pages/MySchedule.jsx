import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'

function MySchedule() {
    const [events, setEvents] = useState([])
    const [hours, setHours] = useState({ worked: 0, max: 160, remaining: 160 })
    const [loading, setLoading] = useState(true)

    // For demo, use first user
    const userId = 1

    useEffect(() => {
        fetchMySchedule()
    }, [])

    const fetchMySchedule = async () => {
        try {
            const now = new Date()
            const year = now.getFullYear()
            const month = String(now.getMonth() + 1).padStart(2, '0')

            const [scheduleRes, hoursRes] = await Promise.all([
                fetch(`/api/schedule/user/${userId}`),
                fetch(`/api/employees/${userId}/hours/${year}/${month}`)
            ])

            const schedule = await scheduleRes.json()
            const hoursData = await hoursRes.json()

            setHours({
                worked: Math.round(hoursData.worked_hours || 0),
                max: hoursData.max_hours || 160,
                remaining: Math.round(hoursData.remaining_hours || 160)
            })

            const calendarEvents = schedule.map(item => ({
                id: item.id,
                title: item.type === 'redder' ? '🏊 Redder dienst' : '🎓 Les geven',
                start: `${item.date}T${item.start_time}`,
                end: `${item.date}T${item.end_time}`,
                backgroundColor: item.type === 'redder' ? '#0ea5e9' : '#6366f1',
                borderColor: item.type === 'redder' ? '#0ea5e9' : '#6366f1'
            }))

            setEvents(calendarEvents)
        } catch (error) {
            console.error('Failed to fetch schedule:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="loading">Laden...</div>
    }

    const hoursPercent = Math.min((hours.worked / hours.max) * 100, 100)

    return (
        <div>
            <div className="page-header">
                <h2>Mijn Rooster</h2>
                <p>Je persoonlijke planning en uren overzicht</p>
            </div>

            <div className="card-grid">
                <div className="card">
                    <h3 style={{ marginBottom: '16px' }}>📊 Uren deze maand</h3>
                    <div style={{ marginBottom: '12px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            fontSize: '14px',
                            color: 'var(--color-text-muted)'
                        }}>
                            <span>{hours.worked} uur gewerkt</span>
                            <span>{hours.remaining} uur beschikbaar</span>
                        </div>
                        <div style={{
                            height: '12px',
                            backgroundColor: 'var(--color-surface-hover)',
                            borderRadius: '6px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${hoursPercent}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                                borderRadius: '6px',
                                transition: 'width 0.5s ease'
                            }} />
                        </div>
                    </div>
                    <p style={{ fontSize: '24px', fontWeight: '700' }}>
                        {hours.worked} / {hours.max} uur
                    </p>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '16px' }}>📋 Legende</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '4px',
                                backgroundColor: '#0ea5e9'
                            }} />
                            <span>🏊 Redder dienst</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '4px',
                                backgroundColor: '#6366f1'
                            }} />
                            <span>🎓 Les geven</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek'
                    }}
                    locale="nl"
                    firstDay={1}
                    events={events}
                    height="auto"
                    slotMinTime="06:00:00"
                    slotMaxTime="22:00:00"
                />
            </div>
        </div>
    )
}

export default MySchedule
