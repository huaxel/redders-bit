import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const success = await login(email, password);
        if (success) {
            navigate('/');
        } else {
            setError('Login mislukt. Controleer uw gegevens.');
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
                    Log in op uw account
                </p>

                {error && (
                    <div className="alert warning" style={{ marginBottom: '20px', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>EMAIL</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="naam@zwembad.be"
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '4px',
                                border: '1px solid var(--color-border)',
                                fontSize: '16px',
                                backgroundColor: 'var(--color-surface)'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>WACHTWOORD</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '4px',
                                border: '1px solid var(--color-border)',
                                fontSize: '16px',
                                backgroundColor: 'var(--color-surface)'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        Inloggen
                    </button>

                    <div style={{ marginTop: '20px', fontSize: '11px', color: 'var(--color-text-muted)', opacity: 0.7 }}>
                        Demo: Gebruik <code>jan@zwembad.be</code> / <code>password123</code>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
