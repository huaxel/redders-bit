import { useState, useEffect } from 'react';
import { client } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { FaExchangeAlt } from 'react-icons/fa';

function SwapMarketplace() {
    const [swaps, setSwaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchSwaps();
    }, []);

    const fetchSwaps = async () => {
        try {
            const res = await client.get('/api/schedule/swaps/open');
            if (res.ok) {
                const data = await res.json();
                setSwaps(data);
            }
        } catch (error) {
            console.error('Failed to fetch swaps:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (swapId) => {
        if (!confirm("Weet je zeker dat je deze shift wilt overnemen?")) return;
        try {
            const res = await client.post(`/api/schedule/swaps/${swapId}/accept`, {});
            if (res.ok) {
                alert("Shift overname verzoek verstuurd! Wacht op goedkeuring van de admin.");
                fetchSwaps();
            } else {
                const err = await res.json();
                alert("Fout: " + err.error);
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) return <div>Laden...</div>;

    if (swaps.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                <FaExchangeAlt style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3, color: 'var(--color-accent)' }} />
                <h3 style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>Rustig op de markt</h3>
                <p>Er zijn momenteel geen ruilverzoeken beschikbaar.</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>Kom later terug of plaats zelf een verzoek via je rooster.</p>
            </div>
        );
    }

    return (
        <div className="card">
            <h3 style={{ marginBottom: '20px' }}>🔄 Ruil Marktplaats</h3>
            <table className="employee-table">
                <thead>
                    <tr>
                        <th>Datum</th>
                        <th>Tijd</th>
                        <th>Huidige Redder</th>
                        <th>Actie</th>
                    </tr>
                </thead>
                <tbody>
                    {swaps.map(swap => (
                        <tr key={swap.id}>
                            <td>{swap.date}</td>
                            <td>{swap.start_time} - {swap.end_time}</td>
                            <td>{swap.requester_name}</td>
                            <td>
                                {swap.requester_id !== user.id ? (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleAccept(swap.id)}
                                        style={{ fontSize: '12px', padding: '6px 12px' }}
                                    >
                                        Overnemen
                                    </button>
                                ) : (
                                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Eigen verzoek</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default SwapMarketplace;
