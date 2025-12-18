import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import { client } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import ShiftActionModal from '../components/ShiftActionModal'

function MySchedule() {
    const [events, setEvents] = useState([])
    const [hours, setHours] = useState({ worked: 0, max: 160, remaining: 160 })
    const [loading, setLoading] = useState(true)
    const [requests, setRequests] = useState([])
    const [selectedShift, setSelectedShift] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { user } = useAuth()

    useEffect(() => {
        if (user) {
            fetchMySchedule()
        }
    }, [user])

    const fetchMySchedule = async () => {
        try {
            const now = new Date()
            const year = now.getFullYear()
            const month = String(now.getMonth() + 1).padStart(2, '0')

            const [scheduleRes, hoursRes, requestsRes] = await Promise.all([
                client.get(`/api/schedule/user/${user.id}`),
                client.get(`/api/employees/${user.id}/hours/${year}/${month}`),
                client.get('/api/schedule/requests')
            ])

            const schedule = await scheduleRes.json()
            const hoursData = await hoursRes.json()
            const reqs = await requestsRes.json()

            setRequests(reqs)

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
                backgroundColor: item.user_color || (item.type === 'redder' ? '#0ea5e9' : '#6366f1'),
                borderColor: item.user_color || (item.type === 'redder' ? '#0ea5e9' : '#6366f1')
            }))

            setEvents(calendarEvents)
        } catch (error) {
            console.error('Failed to fetch schedule:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEventClick = (info) => {
        setSelectedShift({
            id: info.event.id,
            start: info.event.start,
            end: info.event.end,
            title: info.event.title
        })
        setIsModalOpen(true)
    }

    const handleReportSickness = async (reason) => {
        try {
            const res = await client.post(`/api/schedule/${selectedShift.id}/sick`, { reason })
            if (res.ok) {
                alert("Ziekte gemeld. Beterschap!") // Can also be replaced by a toast in future
                setIsModalOpen(false)
                fetchMySchedule()
            } else {
                const err = await res.json()
                alert("Fout: " + err.error)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleRequestSwap = async () => {
        try {
            const res = await client.post(`/api/schedule/${selectedShift.id}/swap`, {})
            if (res.ok) {
                alert("Ruilverzoek aangemaakt. Collega's kunnen dit nu zien op het dashboard.")
                setIsModalOpen(false)
                fetchMySchedule()
            } else {
                const err = await res.json()
                alert("Fout: " + err.error)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleResponse = async (requestId, status) => {
        if (!confirm(`Wil je deze shift ${status === 'accepted' ? 'accepteren' : 'weigeren'}?`)) return;

        try {
            const res = await client.post(`/api/schedule/requests/${requestId}/respond`, { status });
            if (res.ok) {
                fetchMySchedule(); // Refresh
            } else {
                alert("Er ging iets mis.");
            }
        } catch (e) {
            console.error(e);
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

            {requests.length > 0 && (
                <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid var(--color-accent)' }}>
                    <h3 style={{ marginBottom: '16px', color: 'var(--color-accent)' }}>📩 Openstaande Verzoeken</h3>
                    <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {requests.map(req => (
                            <div key={req.id} style={{
                                background: 'rgba(196, 147, 89, 0.1)',
                                padding: '16px',
                                borderRadius: '4px',
                                border: '1px solid rgba(196, 147, 89, 0.3)'
                            }}>
                                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                    {new Date(req.date).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </div>
                                <div style={{ marginBottom: '12px', color: 'var(--color-text-muted)' }}>
                                    {req.start_time} - {req.end_time}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        className="btn btn-primary"
                                        style={{ flex: 1, fontSize: '12px', padding: '8px' }}
                                        onClick={() => handleResponse(req.id, 'accepted')}
                                    >
                                        Accepteren
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        style={{ flex: 1, fontSize: '12px', padding: '8px', borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                                        onClick={() => handleResponse(req.id, 'rejected')}
                                    >
                                        Weigeren
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                    <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                        * Klik op een shift om ziekte te melden of te ruilen.
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
                    eventClick={handleEventClick}
                    height="auto"
                    slotMinTime="06:00:00"
                    slotMaxTime="22:00:00"
                />
            </div>

            <ShiftActionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                shift={selectedShift}
                onReportSickness={handleReportSickness}
                onRequestSwap={handleRequestSwap}
            />
        </div>
    )
}
export default MySchedule
