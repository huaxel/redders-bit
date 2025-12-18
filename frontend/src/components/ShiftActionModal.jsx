import React, { useState } from 'react';

/**
 * ShiftActionModal
 * A premium, Art Deco styled modal for managing shift exceptions.
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - shift: object (The event data)
 * - onReportSickness: function(reason)
 * - onRequestSwap: function()
 */
const ShiftActionModal = ({ isOpen, onClose, shift, onReportSickness, onRequestSwap }) => {
    const [mode, setMode] = useState('initial'); // 'initial', 'sick', 'swap_confirm'
    const [reason, setReason] = useState('');

    if (!isOpen || !shift) return null;

    const handleBack = () => {
        setMode('initial');
        setReason('');
    };

    // Styling constants
    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 59, 70, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    const modalStyle = {
        backgroundColor: 'var(--color-surface)',
        border: '2px solid var(--color-accent)',
        borderRadius: 'var(--radius)',
        padding: '32px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: 'var(--shadow)',
        position: 'relative'
    };

    const headerStyle = {
        fontFamily: "'Playfair Display', serif",
        color: 'var(--color-primary)',
        fontSize: '24px',
        marginBottom: '8px',
        textAlign: 'center'
    };

    const subHeaderStyle = {
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        marginBottom: '24px',
        fontSize: '14px',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    };

    const buttonGrid = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                {/* Decorative Accent */}
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    width: '16px',
                    height: '16px',
                    borderTop: '2px solid var(--color-accent)',
                    borderLeft: '2px solid var(--color-accent)',
                    opacity: 0.5
                }} />

                <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    width: '16px',
                    height: '16px',
                    borderBottom: '2px solid var(--color-accent)',
                    borderRight: '2px solid var(--color-accent)',
                    opacity: 0.5
                }} />

                <h2 style={headerStyle}>Beheer Shift</h2>
                <p style={subHeaderStyle}>
                    {new Date(shift.start).toLocaleDateString()} | {new Date(shift.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>

                {mode === 'initial' && (
                    <div style={buttonGrid}>
                        <button
                            className="btn"
                            style={{
                                backgroundColor: '#FFF',
                                border: '1px solid var(--color-danger)',
                                color: 'var(--color-danger)',
                                height: '120px',
                                flexDirection: 'column',
                                gap: '16px'
                            }}
                            onClick={() => setMode('sick')}
                        >
                            <span style={{ fontSize: '32px' }}>🤢</span>
                            Meld Ziekte
                        </button>

                        <button
                            className="btn btn-primary"
                            style={{
                                height: '120px',
                                flexDirection: 'column',
                                gap: '16px'
                            }}
                            onClick={() => setMode('swap_confirm')}
                        >
                            <span style={{ fontSize: '32px' }}>🔄</span>
                            Ruil Shift
                        </button>
                    </div>
                )}

                {mode === 'sick' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="alert warning">
                            <span>⚠️</span>
                            <span>Let op: Uw shift wordt verwijderd en er wordt een vervanger gezocht.</span>
                        </div>

                        <label style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Reden van verzuim</label>
                        <input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Bijv. Griep, Koorts..."
                            style={{
                                padding: '12px',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius)',
                                fontSize: '16px',
                                fontFamily: "'Montserrat', sans-serif"
                            }}
                            autoFocus
                        />

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleBack}>Terug</button>
                            <button
                                className="btn"
                                style={{ flex: 1, backgroundColor: 'var(--color-danger)', color: 'white' }}
                                onClick={() => onReportSickness(reason)}
                                disabled={!reason.trim()}
                            >
                                Bevestig Zieksemelding
                            </button>
                        </div>
                    </div>
                )}

                {mode === 'swap_confirm' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="alert success">
                            <span>ℹ️</span>
                            <span>Uw shift wordt aangeboden op de interne marktplaats. U blijft verantwoordelijk tot een collega accepteert EN admin goedkeurt.</span>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleBack}>Terug</button>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 1 }}
                                onClick={onRequestSwap}
                            >
                                <span style={{ fontSize: '18px' }}>✅</span>
                                Plaats op Marktplaats
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShiftActionModal;
