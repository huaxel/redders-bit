import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaSwimmer } from 'react-icons/fa';

function Login() {
    const [employees, setEmployees] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }

        // Fetch users for the "Select User" dropdown (Dev Mode)
        fetch('/api/employees')
            .then(res => res.json())
            .then(data => setEmployees(data))
            .catch(err => console.error("Failed to load employees", err));
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        const success = await login(selectedUser);
        if (success) {
            navigate('/');
        } else {
            alert('Login mislukt');
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: 'var(--color-bg)',
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', color: 'var(--color-primary)', marginBottom: '16px' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: '80px', width: 'auto' }} />
                </div>
                <h1 style={{ marginBottom: '8px' }}>Welkom</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>
                    Selecteer een gebruiker om in te loggen
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px' }}>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid var(--color-border)',
                                fontSize: '16px',
                                backgroundColor: 'var(--color-surface)'
                            }}
                        >
                            <option value="">-- Kies een gebruiker --</option>
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name} ({emp.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        disabled={!selectedUser}
                    >
                        Inloggen
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
