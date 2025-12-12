import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { client } from '../api/client'
import ShiftModal from '../components/ShiftModal'
import ComplianceWidget from '../components/ComplianceWidget'
import { FaMagic, FaPlus } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'

function Planning() {
    const [events, setEvents] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)
    const [viewDate, setViewDate] = useState(new Date())
    const { user } = useAuth()

    useEffect(() => {
        fetchData()
    }, [viewDate]) // Refresh when month changes? FullCalendar handles view dates internally but we need to track it for ComplianceWidget

    const fetchData = async () => {
        try {
            const year = viewDate.getFullYear()
            const month = String(viewDate.getMonth() + 1).padStart(2, '0')

            const [scheduleRes, employeesRes, requestsRes] = await Promise.all([
                client.get(`/api/schedule/month/${year}/${month}`),
                client.get('/api/employees'),
                client.get('/api/schedule/requests') // Fetch requests too
            ])

            const schedule = await scheduleRes.json()
            const emps = await employeesRes.json()
            const requests = await requestsRes.json()

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

            // Add Requests as events with distinct styling
            const requestEvents = requests.map(req => ({
                id: `req-${req.id}`,
                title: `❓ ${req.user_name} (Verzoek)`,
                start: `${req.date}T${req.start_time}`,
                end: `${req.date}T${req.end_time}`,
                backgroundColor: 'transparent',
                borderColor: req.user_color || '#C49359',
                textColor: req.user_color || 'var(--color-primary)',
                classNames: ['dashed-event'], // We will add this class to CSS
                extendedProps: {
                    type: 'request',
                    status: req.status
                }
            }))

            setEvents([...calendarEvents, ...requestEvents])
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDateSelect = (selectInfo) => {
        setSelectedDate(selectInfo.startStr)
        setModalOpen(true)
    }

    const handleSaveShift = async (shiftData) => {
        try {
            const res = await client.post('/api/schedule', shiftData)
            const data = await res.json()

            if (!res.ok) {
                alert(data.error || data.warning)
                return
            }

            if (data.warnings && data.warnings.length > 0) {
                alert(`⚠️ Waarschuwing:\n${data.warnings.join('\n')}`)
            }

            setModalOpen(false)
            fetchData() // Refresh
        } catch (error) {
            console.error('Failed to create schedule:', error)
        }
    }

    const handleAutoPlan = async () => {
        if (!confirm("Wil je automatisch verzoeken uitsturen naar redders om de planning te vullen?")) return;

        try {
            const year = viewDate.getFullYear();
            const month = String(viewDate.getMonth() + 1).padStart(2, '0');
            const res = await client.post('/api/schedule/auto', { year, month });
            const data = await res.json();

            if (res.ok) {
                alert(`Succes! ${data.added_requests} verzoeken verstuurd.`);
                fetchData();
            } else {
                alert('Fout bij auto-planning: ' + data.error);
            }
        } catch (e) {
            console.error(e);
            alert('Er ging iets mis.');
        }
    }

    const handleReset = async () => {
        if (!confirm("⚠️ Weet je zeker dat je de hele planning en alle verzoeken wilt wissen? Dit is voor demo doeleinden.")) return;
        try {
            const res = await client.post('/api/reset', {});
            if (res.ok) {
                alert("Planning gereset.");
                fetchData();
            }
        } catch (e) {
            console.error(e);
        }
    }

    if (loading) {
        return <div className="loading">Laden...</div>
    }

    const year = viewDate.getFullYear();
    const month = String(viewDate.getMonth() + 1).padStart(2, '0');

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Planning</h2>
                    <p>Maandplanning voor redders en lesgevers</p>
                </div>
                {user?.role === 'admin' && (
                    <div className="actions-container">
                        <button className="btn btn-outline" onClick={handleReset} style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
                            Reset Demo
                        </button>
                        <button className="btn btn-primary" onClick={handleAutoPlan}>
                            <FaMagic /> Stuur Verzoeken
                        </button>
                    </div>
                )}
            </div>

            <ComplianceWidget year={year} month={month} />

            <div className="card">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek'
                    }}
                    locale="nl"
                    firstDay={1}
                    events={events}
                    selectable={true}
                    select={handleDateSelect}
                    eventClick={(info) => {
                        if (confirm(`Verwijder shift van ${info.event.title}?`)) {
                            client.delete(`/api/schedule/${info.event.id}`)
                                .then(() => fetchData())
                        }
                    }}
                    datesSet={(dateInfo) => {
                        // Update viewDate when user navigates calendar
                        // Use the middle of the view to determine 'current month' roughly
                        const midDate = new Date((dateInfo.start.getTime() + dateInfo.end.getTime()) / 2);
                        if (midDate.getMonth() !== viewDate.getMonth()) {
                            setViewDate(midDate);
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
                                borderRadius: '44px',
                                backgroundColor: emp.color
                            }} />
                            <span>{emp.name}</span>
                            {emp.is_lifeguard === 1 && <span className="badge lifeguard">Redder</span>}
                            {emp.is_instructor === 1 && <span className="badge instructor">Lesgever</span>}
                        </div>
                    ))}
                </div>
            </div>

            <ShiftModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveShift}
                defaultDate={selectedDate}
                employees={employees}
            />
        </div>
    )
}

export default Planning
