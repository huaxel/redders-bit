import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';

/**
 * StatCard component for displaying metrics.
 * Uses accessible wrappers for icons if they are emojis.
 */
const StatCard = ({ icon, value, label, variant = 'primary' }) => {
    return (
        <Card className="stat-card">
            <div className={`stat-icon ${variant}`} role="img" aria-label={label}>
                {icon}
            </div>
            <div className="stat-content">
                <h3>{value}</h3>
                <p>{label}</p>
            </div>
        </Card>
    );
};

StatCard.propTypes = {
    icon: PropTypes.node.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    label: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'danger']),
};

export default StatCard;
