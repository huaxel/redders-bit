import { useState, useEffect } from 'react';
import { client } from '../api/client';
import { FaTimes, FaSave } from 'react-icons/fa';

function ShiftModal({ isOpen, onClose, onSave, defaultDate, employees }) {
    const [formData, setFormData] = useState({
        userId: '',
        date: defaultDate || '',
        startTime: '09:00',
        endTime: '17:00',
        type: 'redder',
        notes: ''
    });
    const [warnings, setWarnings] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (defaultDate) {
            setFormData(prev => ({ ...prev, date: defaultDate }));
        }
    }, [defaultDate]);

    useEffect(() => {
        // Auto-set type based on user role
        if (formData.userId) {
            const emp = employees.find(e => e.id === parseInt(formData.userId));
            if (emp) {
                setFormData(prev => ({
                    ...prev,
                    type: emp.is_lifeguard ? 'redder' : 'lesgever'
                }));
            }
        }
    }, [formData.userId, employees]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setWarnings([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.userId) {
            setError('Selecteer een medewerker');
            return;
        }

        // Validate first (Dry Run)
        try {
            const validationRes = await client.post('/api/compliance/validate', {
                user_id: formData.userId,
                date: formData.date,
                start_time: formData.startTime,
                end_time: formData.endTime,
                type: formData.type
            });
            const validation = await validationRes.json();

            if (!validation.valid) {
                setError(validation.errors.join(', '));
                return;
            }

            if (validation.warnings && validation.warnings.length > 0) {
                // If warnings exist and we haven't confirmed yet, show them
                if (warnings.length === 0) {
                    setWarnings(validation.warnings);
                    return; // Stop to show warnings, user must click save again to confirm (logic below)
                }
            }

            // Save
            onSave({
                user_id: formData.userId,
                date: formData.date,
                start_time: formData.startTime,
                end_time: formData.endTime,
                type: formData.type,
                notes: formData.notes
            });

            // Reset modal state handled by parent closing it? 
            // Better to clear local state just in case
            setWarnings([]);
            setError('');

        } catch (err) {
            console.error("Validation/Save error", err);
            setError("Er ging iets mis bij het opslaan.");
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>Nieuwe Shift Inplannen</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}><FaTimes /></button>
                </div>

                {error && (
                    <div className="alert warning" style={{ marginBottom: '16px', backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                        ⚠️ {error}
                    </div>
                )}

                {warnings.length > 0 && (
                    <div className="alert warning" style={{ marginBottom: '16px' }}>
                        <div><strong>⚠️ Let op:</strong></div>
                        <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                            {warnings.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                        <div style={{ marginTop: '8px', fontSize: '12px' }}>Klik nogmaals op Opslaan om te bevestigen.</div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Datum</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Medewerker</label>
                        <select
                            name="userId"
                            value={formData.userId}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                            required
                        >
                            <option value="">-- Selecteer --</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name} {emp.is_lifeguard ? '(🏊)' : ''} {emp.is_instructor ? '(🎓)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Start Tijd</label>
                            <input
                                type="time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Eind Tijd</label>
                            <input
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Type Shift</label>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="redder"
                                    checked={formData.type === 'redder'}
                                    onChange={handleChange}
                                /> 🏊 Redder
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="lesgever"
                                    checked={formData.type === 'lesgever'}
                                    onChange={handleChange}
                                /> 🎓 Lesgever
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ backgroundColor: 'transparent', border: '1px solid var(--color-border)' }}>Annuleren</button>
                        <button type="submit" className="btn btn-primary"><FaSave /> Opslaan</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ShiftModal;
