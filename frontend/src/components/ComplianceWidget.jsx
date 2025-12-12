import { useState, useEffect } from 'react';
import { client } from '../api/client';
import { FaShieldAlt, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';

function ComplianceWidget({ year, month, poolId = 1 }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (year && month) {
            fetchCompliance();
        }
    }, [year, month, poolId]);

    const fetchCompliance = async () => {
        setLoading(true);
        try {
            const res = await client.get(`/api/compliance/vlarem/${poolId}/${year}/${month}`);
            const data = await res.json();
            setReport(data);
        } catch (error) {
            console.error("Failed to fetch compliance:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '16px', color: 'var(--color-text-muted)' }}>Checking VLAREM...</div>;
    if (!report) return null;

    // Count issues
    const days = Object.keys(report);
    const issues = days.filter(date => report[date].status === 'deficiency').length;

    return (
        <div className="card" style={{ marginBottom: '24px', borderLeft: issues > 0 ? '4px solid var(--color-danger)' : '4px solid var(--color-success)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        fontSize: '24px',
                        color: issues > 0 ? 'var(--color-danger)' : 'var(--color-success)'
                    }}>
                        {issues > 0 ? <FaExclamationTriangle /> : <FaCheckCircle />}
                    </div>
                    <div>
                        <h3 style={{ margin: 0 }}>VLAREM II Compliance Check</h3>
                        <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                            {issues === 0
                                ? "✅ Voldoende redders ingepland voor de hele maand."
                                : `⚠️  Op ${issues} dag(en) zijn er te weinig redders ingepland.`
                            }
                        </p>
                    </div>
                </div>
                {issues > 0 && (
                    <button onClick={fetchCompliance} className="btn btn-outline" style={{ fontSize: '12px' }}>
                        Verversen
                    </button>
                )}
            </div>

            {issues > 0 && (
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {days.filter(date => report[date].status === 'deficiency').map(date => (
                        <span key={date} style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            fontSize: '12px',
                            fontWeight: 500
                        }}>
                            {new Date(date).toLocaleDateString()}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ComplianceWidget;
